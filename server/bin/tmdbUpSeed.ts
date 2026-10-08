/**
 * Applique le calendrier des sorties produit par tmdbFetchUpcoming.ts.
 *
 * À lancer APRÈS tmdbSeed.ts :
 *
 *   npm run db:migrate
 *   npm run tmdb:seed      → le catalogue
 *   npm run tmdbAct:seed   → le casting complet (optionnel)
 *   npm run tmdbUp:seed    → les sorties à venir
 *
 * Le script est purement additif : il n'efface rien et n'insère que ce
 * qui manque. Le relancer deux fois de suite ne crée aucun doublon.
 *
 * Usage : npm run tmdbUp:seed
 */

import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

import database from "../database/client";

import type { Rows } from "../database/client";

const UPCOMING_FILE = path.join(
  __dirname,
  "../database/seeds/tmdb-upcoming.json.gz",
);

/* ------------------------------------------------------------------ *
 * Types (miroir de la sortie de tmdbFetchUpcoming.ts)
 * ------------------------------------------------------------------ */

type SeedCredit = {
  person_tmdb_id: number;
  personnage_name: string | null;
  role: string;
};

type SeedEpisode = {
  tmdb_id: number;
  number: number;
  name: string;
  released_at: string | null;
  synopsis: string | null;
  duration: number | null;
};

type SeedSeason = {
  tmdb_id: number;
  number: number;
  name: string;
  released_at: string | null;
  poster: string | null;
  synopsis: string | null;
  is_finished: boolean;
  episodes: SeedEpisode[];
};

type SeedMedia = {
  tmdb_id: number;
  type: "movie" | "tv";
  is_anime: boolean;
  name: string;
  original_name: string | null;
  original_language: string | null;
  released_at: string | null;
  duration: number | null;
  poster: string | null;
  synopsis: string | null;
  overall_rating: number | null;
  status: string | null;
  pegi: string | null;
  genres: number[];
  platforms: number[];
  cast: SeedCredit[];
  seasons: SeedSeason[];
};

type UpcomingFile = {
  generated_at: string;
  window: { from: string; to: string };
  genres: { tmdb_id: number; name: string }[];
  platforms: {
    tmdb_id: number;
    name: string;
    logo: string | null;
    url: string | null;
  }[];
  persons: {
    tmdb_id: number;
    name: string;
    biography: string | null;
    photo: string | null;
  }[];
  medias: SeedMedia[];
  series_updates: {
    media_tmdb_id: number;
    media_name: string;
    seasons: SeedSeason[];
  }[];
};

/* ------------------------------------------------------------------ *
 * Utilitaires
 * ------------------------------------------------------------------ */

const CHUNK_SIZE = 500;

const insertMany = async (
  table: string,
  columns: string[],
  rows: unknown[][],
  label = table,
) => {
  if (rows.length === 0) {
    console.info(`  ${label} : rien à ajouter`);
    return;
  }

  const columnList = columns.join(", ");

  for (let index = 0; index < rows.length; index += CHUNK_SIZE) {
    const batch = rows.slice(index, index + CHUNK_SIZE);

    await database.query(`INSERT INTO ${table} (${columnList}) VALUES ?`, [
      batch,
    ]);
  }

  console.info(`  ${label} : ${rows.length} ligne(s) ajoutée(s)`);
};

/** Correspondance tmdb_id → id auto-incrémenté. */
const buildIdMap = async (table: string) => {
  const [rows] = await database.query<Rows>(`SELECT id, tmdb_id FROM ${table}`);

  const map = new Map<number, number>();

  for (const row of rows as unknown as { id: number; tmdb_id: number }[]) {
    map.set(row.tmdb_id, row.id);
  }

  return map;
};

/**
 * media est la seule table où tmdb_id ne suffit pas : films et séries
 * partagent le même espace de numérotation chez TMDB.
 */
const buildMediaIdMap = async () => {
  const [rows] = await database.query<Rows>(
    "SELECT id, tmdb_id, type FROM media",
  );

  const map = new Map<string, number>();

  for (const row of rows as unknown as {
    id: number;
    tmdb_id: number;
    type: string;
  }[]) {
    map.set(`${row.type}:${row.tmdb_id}`, row.id);
  }

  return map;
};

/* ------------------------------------------------------------------ *
 * Seed
 * ------------------------------------------------------------------ */

const seed = async () => {
  if (!fs.existsSync(UPCOMING_FILE)) {
    throw new Error(
      `Fichier introuvable : ${UPCOMING_FILE}\nLancez d'abord "npm run tmdb:fetch:upcoming".`,
    );
  }

  const data = JSON.parse(
    zlib.gunzipSync(fs.readFileSync(UPCOMING_FILE)).toString("utf8"),
  ) as UpcomingFile;

  console.info(
    `Calendrier du ${data.window.from} au ${data.window.to} (export du ${data.generated_at})\n`,
  );

  /* --- 1. Référentiels --------------------------------------------- */

  const existingGenres = await buildIdMap("genre");

  await insertMany(
    "genre",
    ["tmdb_id", "name"],
    data.genres
      .filter((genre) => !existingGenres.has(genre.tmdb_id))
      .map((genre) => [genre.tmdb_id, genre.name]),
  );

  const existingPlatforms = await buildIdMap("platform");

  await insertMany(
    "platform",
    ["tmdb_id", "name", "logo", "url"],
    data.platforms
      .filter((platform) => !existingPlatforms.has(platform.tmdb_id))
      .map((platform) => [
        platform.tmdb_id,
        platform.name,
        platform.logo,
        platform.url,
      ]),
  );

  const existingPersons = await buildIdMap("person");

  await insertMany(
    "person",
    ["tmdb_id", "name", "biography", "photo"],
    data.persons
      .filter((person) => !existingPersons.has(person.tmdb_id))
      .map((person) => [
        person.tmdb_id,
        person.name,
        person.biography,
        person.photo,
      ]),
  );

  // Rechargés après insertion, pour contenir les nouveaux identifiants.
  const genreIds = await buildIdMap("genre");
  const platformIds = await buildIdMap("platform");
  const personIds = await buildIdMap("person");

  /* --- 2. Nouveaux médias -------------------------------------------- */

  const existingMedia = await buildMediaIdMap();

  const newMedias = data.medias.filter(
    (media) => !existingMedia.has(`${media.type}:${media.tmdb_id}`),
  );

  await insertMany(
    "media",
    [
      "tmdb_id",
      "name",
      "type",
      "released_at",
      "duration",
      "poster",
      "synopsis",
      "overall_rating",
      "status",
      "original_name",
      "original_language",
      "pegi",
      "is_anime",
    ],
    newMedias.map((media) => [
      media.tmdb_id,
      media.name,
      media.type,
      media.released_at,
      media.duration,
      media.poster,
      media.synopsis,
      media.overall_rating,
      media.status,
      media.original_name,
      media.original_language,
      media.pegi,
      media.is_anime,
    ]),
  );

  const mediaIds = await buildMediaIdMap();

  const mediaKey = (media: { type: string; tmdb_id: number }) =>
    mediaIds.get(`${media.type}:${media.tmdb_id}`);

  /* --- 3. Liaisons des nouveaux médias --------------------------------- */

  const classifyAs: unknown[][] = [];
  const availableOn: unknown[][] = [];
  const mediaPerson: unknown[][] = [];

  for (const media of newMedias) {
    const id = mediaKey(media);

    if (!id) continue;

    for (const genreTmdbId of media.genres) {
      const genreId = genreIds.get(genreTmdbId);

      if (genreId) classifyAs.push([id, genreId]);
    }

    for (const platformTmdbId of media.platforms) {
      const platformId = platformIds.get(platformTmdbId);

      if (platformId) availableOn.push([id, platformId]);
    }

    for (const credit of media.cast) {
      const personId = personIds.get(credit.person_tmdb_id);

      if (personId) {
        mediaPerson.push([id, personId, credit.personnage_name, credit.role]);
      }
    }
  }

  await insertMany("classify_as", ["ID_media", "ID_genre"], classifyAs);
  await insertMany("available_on", ["ID_media", "ID_platform"], availableOn);
  await insertMany(
    "media_person",
    ["ID_media", "ID_person", "personnage_name", "role"],
    mediaPerson,
  );

  /* --- 4. Saisons ------------------------------------------------------ */

  // Les saisons des nouveaux médias et celles des suites sont traitées
  // ensemble : dans les deux cas, on n'insère que ce qui manque.
  type SeasonTask = { mediaId: number; season: SeedSeason };

  const seasonTasks: SeasonTask[] = [];

  for (const media of data.medias) {
    const id = mediaKey(media);

    if (!id) continue;

    for (const season of media.seasons) {
      seasonTasks.push({ mediaId: id, season });
    }
  }

  let missingSeries = 0;

  for (const update of data.series_updates) {
    const id = mediaIds.get(`tv:${update.media_tmdb_id}`);

    // Une série du fichier absente de la base : le dump principal a
    // changé depuis. On l'ignore plutôt que de planter.
    if (!id) {
      missingSeries += 1;
      continue;
    }

    for (const season of update.seasons) {
      seasonTasks.push({ mediaId: id, season });
    }
  }

  if (missingSeries > 0) {
    console.info(
      `  ↷ ${missingSeries} série(s) du calendrier absente(s) de la base, ignorée(s)`,
    );
  }

  const existingSeasons = await buildIdMap("season");

  await insertMany(
    "season",
    [
      "tmdb_id",
      "name",
      "number",
      "released_at",
      "poster",
      "synopsis",
      "is_finished",
      "ID_media",
    ],
    seasonTasks
      .filter((task) => !existingSeasons.has(task.season.tmdb_id))
      .map((task) => [
        task.season.tmdb_id,
        task.season.name,
        task.season.number,
        task.season.released_at,
        task.season.poster,
        task.season.synopsis,
        task.season.is_finished,
        task.mediaId,
      ]),
  );

  const seasonIds = await buildIdMap("season");

  /* --- 5. Épisodes ------------------------------------------------------ */

  const existingEpisodes = await buildIdMap("episode");

  const episodeRows: unknown[][] = [];
  const seenEpisodes = new Set<number>();

  for (const task of seasonTasks) {
    const seasonId = seasonIds.get(task.season.tmdb_id);

    if (!seasonId) continue;

    for (const episode of task.season.episodes) {
      if (existingEpisodes.has(episode.tmdb_id)) continue;

      // Une même saison peut apparaître deux fois dans le fichier
      // (nouveauté et suite) : on ne l'insère qu'une seule fois.
      if (seenEpisodes.has(episode.tmdb_id)) continue;

      seenEpisodes.add(episode.tmdb_id);

      episodeRows.push([
        episode.tmdb_id,
        episode.name,
        episode.number,
        episode.released_at,
        episode.synopsis,
        episode.duration,
        seasonId,
      ]);
    }
  }

  await insertMany(
    "episode",
    [
      "tmdb_id",
      "name",
      "number",
      "released_at",
      "synopsis",
      "duration",
      "ID_season",
    ],
    episodeRows,
  );

  /* --- Récapitulatif ----------------------------------------------------- */

  const [upcomingMedia] = await database.query<Rows>(
    "SELECT COUNT(*) AS total FROM media WHERE released_at > CURDATE()",
  );

  const [upcomingEpisodes] = await database.query<Rows>(
    "SELECT COUNT(*) AS total FROM episode WHERE released_at > CURDATE()",
  );

  const count = (rows: Rows) =>
    (rows as unknown as { total: number }[])[0]?.total ?? 0;

  console.info(`
✔ Calendrier appliqué
  Nouveaux médias   : ${newMedias.length}
  Nouveaux épisodes : ${episodeRows.length}
  ─────────────
  En base, à venir  : ${count(upcomingMedia)} média(s), ${count(upcomingEpisodes)} épisode(s)
`);
};

seed()
  .catch((error) => {
    console.error("Échec du seed calendrier :", error);
    process.exitCode = 1;
  })
  .finally(() => database.end());
