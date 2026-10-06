/**
 * Applique le casting complet produit par tmdbFetchCast.ts.
 *
 * À lancer APRÈS tmdbSeed.ts, et seulement si l'on veut le casting
 * exhaustif :
 *
 *   npm run db:migrate
 *   npm run tmdb:seed      → le catalogue
 *   npm run tmdbAct:seed   → le casting complet par-dessus
 *
 * Le script ajoute les acteurs manquants, puis REMPLACE le casting des
 * médias et des épisodes concernés. Il est rejouable sans créer de
 * doublon.
 *
 * Usage : npm run tmdbAct:seed
 */

import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

import database from "../database/client";

import type { Rows } from "../database/client";

const CAST_FILE = path.join(__dirname, "../database/seeds/tmdb-cast.json.gz");

/* ------------------------------------------------------------------ *
 * Types (miroir de la sortie de tmdbFetchCast.ts)
 * ------------------------------------------------------------------ */

type SeedCredit = {
  person_tmdb_id: number;
  personnage_name: string | null;
  role: string;
};

type CastFile = {
  generated_at: string;
  persons: {
    tmdb_id: number;
    name: string;
    biography: string | null;
    photo: string | null;
  }[];
  media_cast: {
    media_tmdb_id: number;
    media_type: "movie" | "tv";
    cast: SeedCredit[];
  }[];
  episode_cast: {
    episode_tmdb_id: number;
    cast: SeedCredit[];
  }[];
};

/* ------------------------------------------------------------------ *
 * Utilitaires
 * ------------------------------------------------------------------ */

const CHUNK_SIZE = 500;

const chunk = <T>(items: T[], size = CHUNK_SIZE): T[][] => {
  const batches: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }

  return batches;
};

const insertMany = async (
  table: string,
  columns: string[],
  rows: unknown[][],
) => {
  if (rows.length === 0) return;

  const columnList = columns.join(", ");

  for (const batch of chunk(rows)) {
    await database.query(`INSERT INTO ${table} (${columnList}) VALUES ?`, [
      batch,
    ]);
  }

  console.info(`  ${table} : ${rows.length} ligne(s) insérée(s)`);
};

/** Supprime par paquets : un IN (...) de 36 000 valeurs ferait exploser la requête. */
const deleteByIds = async (table: string, column: string, ids: number[]) => {
  if (ids.length === 0) return;

  let removed = 0;

  for (const batch of chunk(ids, 1000)) {
    const placeholders = batch.map(() => "?").join(", ");

    await database.query(
      `DELETE FROM ${table} WHERE ${column} IN (${placeholders})`,
      batch,
    );

    removed += batch.length;
  }

  console.info(`  ${table} : casting vidé pour ${removed} entrée(s)`);
};

const buildIdMap = async (table: string) => {
  const [rows] = await database.query<Rows>(`SELECT id, tmdb_id FROM ${table}`);

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
  if (!fs.existsSync(CAST_FILE)) {
    throw new Error(
      `Fichier introuvable : ${CAST_FILE}\nLancez d'abord "npm run tmdb:fetch:cast".`,
    );
  }

  const data = JSON.parse(
    zlib.gunzipSync(fs.readFileSync(CAST_FILE)).toString("utf8"),
  ) as CastFile;

  console.info(`Casting depuis un export du ${data.generated_at}\n`);

  /* --- 1. Acteurs manquants ---------------------------------------- */

  const existingPersons = await buildIdMap("person");

  const newPersons = data.persons.filter(
    (person) => !existingPersons.has(person.tmdb_id),
  );

  await insertMany(
    "person",
    ["tmdb_id", "name", "biography", "photo"],
    newPersons.map((person) => [
      person.tmdb_id,
      person.name,
      person.biography,
      person.photo,
    ]),
  );

  // Rechargée après insertion, pour contenir les nouveaux identifiants.
  const personIds = await buildIdMap("person");

  /* --- 2. Casting des médias ---------------------------------------- */

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

  const mediaPersonRows: unknown[][] = [];
  const touchedMediaIds: number[] = [];

  for (const entry of data.media_cast) {
    const mediaId = mediaIds.get(`${entry.media_type}:${entry.media_tmdb_id}`);

    // Un média du fichier casting absent de la base : le dump principal
    // a changé depuis. On l'ignore plutôt que de planter.
    if (!mediaId) continue;

    touchedMediaIds.push(mediaId);

    for (const credit of entry.cast) {
      const personId = personIds.get(credit.person_tmdb_id);

      if (!personId) continue;

      mediaPersonRows.push([
        mediaId,
        personId,
        credit.personnage_name,
        credit.role,
      ]);
    }
  }

  // On remplace plutôt que d'ajouter : le casting complet est un
  // sur-ensemble de celui posé par tmdbSeed, et cela rend le script
  // rejouable sans doublon.
  await deleteByIds("media_person", "ID_media", touchedMediaIds);

  await insertMany(
    "media_person",
    ["ID_media", "ID_person", "personnage_name", "role"],
    mediaPersonRows,
  );

  /* --- 3. Casting des épisodes --------------------------------------- */

  const episodeIds = await buildIdMap("episode");

  const episodePersonRows: unknown[][] = [];
  const touchedEpisodeIds: number[] = [];

  for (const entry of data.episode_cast) {
    const episodeId = episodeIds.get(entry.episode_tmdb_id);

    if (!episodeId) continue;

    touchedEpisodeIds.push(episodeId);

    for (const credit of entry.cast) {
      const personId = personIds.get(credit.person_tmdb_id);

      if (!personId) continue;

      episodePersonRows.push([
        episodeId,
        personId,
        credit.personnage_name,
        credit.role,
      ]);
    }
  }

  await deleteByIds("episode_person", "ID_episode", touchedEpisodeIds);

  await insertMany(
    "episode_person",
    ["ID_episode", "ID_person", "personnage_name", "role"],
    episodePersonRows,
  );

  console.info(`
✔ Casting complet appliqué
  Acteurs ajoutés : ${newPersons.length}
  Médias traités  : ${touchedMediaIds.length}
  Épisodes traités: ${touchedEpisodeIds.length}
`);
};

seed()
  .catch((error) => {
    console.error("Échec du seed casting :", error);
    process.exitCode = 1;
  })
  .finally(() => database.end());
