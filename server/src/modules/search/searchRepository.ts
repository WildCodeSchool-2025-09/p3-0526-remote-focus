import client from "../../../database/client";
import type { Rows } from "../../../database/client";

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
