import client from "../../../database/client";
import type { Rows } from "../../../database/client";

//recherche par média
export interface MediaSearchRow extends Rows {
  id: number;
  name: string;
  type: "movie" | "series" | "anime";
  poster: string | null;
  released_at: Date | null;
}

export async function findMediaByTitle(
  q: string,
  type: string | undefined,
  limit: number,
  offset: number,
): Promise<MediaSearchRow[]> {
  const params: unknown[] = [`%${q}%`];
  let typeClause = "";

  if (type) {
    typeClause = "AND m.type = ?";
    params.push(type);
  }

  params.push(limit, offset);

  const [rows] = await client.query<MediaSearchRow[]>(
    `SELECT m.id, m.name, m.type, m.poster, m.released_at
      FROM media m
      WHERE m.name LIKE ? ${typeClause}
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
): Promise<number> {
  const params: unknown[] = [`%${q}%`];
  let typeClause = "";

  if (type) {
    typeClause = "AND m.type = ?";
    params.push(type);
  }

  const [rows] = await client.query<Rows>(
    `SELECT COUNT(*) as total FROM media m WHERE m.name LIKE ? ${typeClause}`,
    params,
  );

  return (rows as { total: number }[])[0].total;
}
