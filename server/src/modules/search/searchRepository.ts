import client from "../../../database/client";
import type { Rows } from "../../../database/client";
import { PEGI16_VALUES } from "../../utils/applyPegiFilter";

//recherche par média
export interface MediaSearchRow extends Rows {
  id: number;
  name: string;
  type: "movie" | "tv";
  is_anime: number | boolean;
  poster: string | null;
  released_at: Date | null;
  pegi: string | null;
}

export async function findMediaByTitle(
  q: string,
  type: string | undefined,
  hidePegi16: boolean,
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
    `SELECT m.id, m.name, m.type, m.is_anime, m.poster, m.released_at, m.pegi
      FROM media m
      WHERE m.name LIKE ? ${typeClause} ${pegiClause}
      ORDER BY m.name ASC
      LIMIT ? OFFSET ?`,
    params,
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
