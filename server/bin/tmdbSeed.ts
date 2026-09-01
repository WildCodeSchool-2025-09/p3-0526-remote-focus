/**
 * Insertion en base des données produites par tmdbFetch.ts
 *
 * Ce script ne contacte jamais TMDB : aucune clé API n'est nécessaire.
 * À lancer après npm run db:migrate.
 *
 * Usage : npm run tmdb:seed
 */

import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import database from "../database/client";

import type { Rows } from "../database/client";

const SEED_FILE = path.join(__dirname, "../database/seeds/tmdb.json");

/* ------------------------------------------------------------------ *
 * Types (miroir de la sortie de tmdbFetch.ts)
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
  cast: SeedCredit[];
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

type SeedFile = {
  generated_at: string;
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
};

/* ------------------------------------------------------------------ *
 * Utilitaires
 * ------------------------------------------------------------------ */

const CHUNK_SIZE = 500;

/** Insertion groupée : un INSERT multi-lignes par tranche de 500. */
const insertMany = async (
  table: string,
  columns: string[],
  rows: unknown[][],
) => {
  if (rows.length === 0) return;

  const columnList = columns.join(", ");

  for (let index = 0; index < rows.length; index += CHUNK_SIZE) {
    const chunk = rows.slice(index, index + CHUNK_SIZE);

    await database.query(`INSERT INTO ${table} (${columnList}) VALUES ?`, [
      chunk,
    ]);
  }

  console.info(`  ${table} : ${rows.length} ligne(s)`);
};

/** Construit la correspondance tmdb_id → id auto-incrémenté. */
const buildIdMap = async (table: string) => {
  const [rows] = await database.query<Rows>(
    `SELECT id, tmdb_id FROM ${table}`,
  );

  const map = new Map<number, number>();

  for (const row of rows as unknown as { id: number; tmdb_id: number }[]) {
    map.set(row.tmdb_id, row.id);
  }

  return map;
};

/* ------------------------------------------------------------------ *
 * Seed
 * ------------------------------------------------------------------ */

const seed = async () => {
  if (!fs.existsSync(SEED_FILE)) {
    throw new Error(
      `Fichier introuvable : ${SEED_FILE}\nLancez d'abord "npm run tmdb:fetch".`,
    );
  }

  const data = JSON.parse(fs.readFileSync(SEED_FILE, "utf8")) as SeedFile;

  console.info(`Seed depuis un export du ${data.generated_at}\n`);

  // Vidage : on désactive les contraintes le temps du nettoyage pour ne
  // pas avoir à respecter l'ordre des dépendances.
  await database.query("SET FOREIGN_KEY_CHECKS = 0");

  for (const table of [
    "episode_person",
    "media_person",
    "available_on",
    "classify_as",
    "episode",
    "season",
    "media",
    "person",
    "platform",
    "genre",
  ]) {
    await database.query(`TRUNCATE TABLE ${table}`);
  }

  await database.query("SET FOREIGN_KEY_CHECKS = 1");

  /* --- Référentiels ------------------------------------------------ */

  await insertMany(
    "genre",
    ["tmdb_id", "name"],
    data.genres.map((genre) => [genre.tmdb_id, genre.name]),
  );

  await insertMany(
    "platform",
    ["tmdb_id", "name", "logo", "url"],
    data.platforms.map((platform) => [
      platform.tmdb_id,
      platform.name,
      platform.logo,
      platform.url,
    ]),
  );

  await insertMany(
    "person",
    ["tmdb_id", "name", "biography", "photo"],
    data.persons.map((person) => [
      person.tmdb_id,
      person.name,
      person.biography,
      person.photo,
    ]),
  );

  const genreIds = await buildIdMap("genre");
  const platformIds = await buildIdMap("platform");
  const personIds = await buildIdMap("person");

  /* --- Médias ------------------------------------------------------ */

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
    data.medias.map((media) => [
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

  // media est la seule table où tmdb_id ne suffit pas : films et séries
  // partagent le même espace de numérotation chez TMDB.
  const [mediaRows] = await database.query<Rows>(
    "SELECT id, tmdb_id, type FROM media",
  );

  const mediaIds = new Map<string, number>();

  for (const row of mediaRows as unknown as {
    id: number;
    tmdb_id: number;
    type: string;
  }[]) {
    mediaIds.set(`${row.type}:${row.tmdb_id}`, row.id);
  }

  const mediaKey = (media: { type: string; tmdb_id: number }) =>
    mediaIds.get(`${media.type}:${media.tmdb_id}`);

  /* --- Liaisons des médias ----------------------------------------- */

  const classifyAs: unknown[][] = [];
  const availableOn: unknown[][] = [];
  const mediaPerson: unknown[][] = [];

  for (const media of data.medias) {
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

  /* --- Saisons ----------------------------------------------------- */

  const seasons: unknown[][] = [];

  for (const media of data.medias) {
    const id = mediaKey(media);

    if (!id) continue;

    for (const season of media.seasons) {
      seasons.push([
        season.tmdb_id,
        season.name,
        season.number,
        season.released_at,
        season.poster,
        season.synopsis,
        season.is_finished,
        id,
      ]);
    }
  }

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
    seasons,
  );

  const seasonIds = await buildIdMap("season");

  /* --- Épisodes ---------------------------------------------------- */

  const episodes: unknown[][] = [];

  for (const media of data.medias) {
    for (const season of media.seasons) {
      const seasonId = seasonIds.get(season.tmdb_id);

      if (!seasonId) continue;

      for (const episode of season.episodes) {
        episodes.push([
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
    episodes,
  );

  const episodeIds = await buildIdMap("episode");

  /* --- Casting des épisodes ---------------------------------------- */

  const episodePerson: unknown[][] = [];
  const seen = new Set<string>();

  for (const media of data.medias) {
    for (const season of media.seasons) {
      for (const episode of season.episodes) {
        const episodeId = episodeIds.get(episode.tmdb_id);

        if (!episodeId) continue;

        for (const credit of episode.cast) {
          const personId = personIds.get(credit.person_tmdb_id);

          if (!personId) continue;

          // TMDB peut lister une même personne dans cast et guest_stars.
          const key = `${episodeId}:${personId}`;

          if (seen.has(key)) continue;

          seen.add(key);

          episodePerson.push([
            episodeId,
            personId,
            credit.personnage_name,
            credit.role,
          ]);
        }
      }
    }
  }

  await insertMany(
    "episode_person",
    ["ID_episode", "ID_person", "personnage_name", "role"],
    episodePerson,
  );

  console.info("\n✔ Base peuplée depuis TMDB");
};

seed()
  .catch((error) => {
    console.error("Échec du seed :", error);
    process.exitCode = 1;
  })
  .finally(() => database.end());
