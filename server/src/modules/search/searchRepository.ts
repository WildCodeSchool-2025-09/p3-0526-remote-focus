import client from "../../../database/client";
import type { Rows } from "../../../database/client";
import { PEGI16_VALUES } from "../../utils/applyPegiFilter";

export type SortBy = "name" | "rating" | "date";
export type SortOrder = "asc" | "desc";

const SORT_COLUMNS: Record<SortBy, string> = {
  name: "m.name",
  rating: "m.overall_rating",
  date: "m.released_at",
};

function buildOrderByClause(sortBy: SortBy, sortOrder: SortOrder): string {
  return `${SORT_COLUMNS[sortBy]} ${sortOrder.toUpperCase()}`;
}

//recherche par média
export interface MediaSearchRow extends Rows {
  id: number;
  tmdb_id: number;
  name: string;
  type: "movie" | "tv";
  is_anime: number | boolean;
  poster: string | null;
  released_at: Date | null;
  pegi: string | null;
  overall_rating: number | string | null;
}

export async function findMediaByTitle(
  q: string,
  type: string | undefined,
  hidePegi16: boolean,
  sortBy: SortBy,
  sortOrder: SortOrder,
  limit: number,
  offset: number,
): Promise<MediaSearchRow[]> {
  const params: unknown[] = [`%${q}%`];
  let typeClause = "";

  // "anime" n'est pas une valeur de la colonne type (movie/tv) mais un flag séparé is_anime
  if (type === "anime") {
    typeClause = "AND m.is_anime = 1";
  } else if (type === "movie" || type === "tv") {
    typeClause = "AND m.type = ? AND m.is_anime = 0";
    params.push(type);
  }

  let pegiClause = "";
  if (hidePegi16) {
    pegiClause = "AND (m.pegi IS NULL OR m.pegi NOT IN (?))";
    params.push(PEGI16_VALUES);
  }

  params.push(limit, offset);

  const [rows] = await client.query<MediaSearchRow[]>(
    `SELECT m.id, m.tmdb_id, m.name, m.type, m.is_anime, m.poster, m.released_at, m.pegi, m.overall_rating
      FROM media m
      WHERE m.name LIKE ? ${typeClause} ${pegiClause}
      ORDER BY ${buildOrderByClause(sortBy, sortOrder)}
      LIMIT ? OFFSET ?`,
    params,
  );

  return rows;
}

// Table de petite taille : dédoublonnage des résultats TMDB contre TOUT
// le catalogue local, indépendamment de la pagination/du filtre de type
// appliqués à la recherche elle-même.
export interface LocalTmdbIdRow extends Rows {
  tmdb_id: number;
  type: "movie" | "tv";
}

export async function findAllLocalTmdbIds(): Promise<LocalTmdbIdRow[]> {
  const [rows] = await client.query<LocalTmdbIdRow[]>(
    "SELECT tmdb_id, type FROM media",
  );
  return rows;
}

//recherche par nom
export interface PersonSearchRow extends Rows {
  id: number;
  name: string;
  photo: string | null;
}

export async function findPersonByName(
  q: string,
  limit: number,
  offset: number,
): Promise<PersonSearchRow[]> {
  const [rows] = await client.query<PersonSearchRow[]>(
    `SELECT p.ID as id, p.name, p.photo
     FROM person p
     WHERE p.name LIKE ?
     ORDER BY p.name ASC
     LIMIT ? OFFSET ?`,
    [`%${q}%`, limit, offset],
  );

  return rows;
}

//pour stocker le nombre de résultat
export async function countMediaByTitle(
  q: string,
  type: string | undefined,
  hidePegi16: boolean,
): Promise<number> {
  const params: unknown[] = [`%${q}%`];
  let typeClause = "";

  if (type === "anime") {
    typeClause = "AND m.is_anime = 1";
  } else if (type === "movie" || type === "tv") {
    typeClause = "AND m.type = ? AND m.is_anime = 0";
    params.push(type);
  }

  let pegiClause = "";
  if (hidePegi16) {
    pegiClause = "AND (m.pegi IS NULL OR m.pegi NOT IN (?))";
    params.push(PEGI16_VALUES);
  }

  const [rows] = await client.query<Rows>(
    `SELECT COUNT(*) as total FROM media m WHERE m.name LIKE ? ${typeClause} ${pegiClause}`,
    params,
  );

  return (rows as { total: number }[])[0].total;
}
