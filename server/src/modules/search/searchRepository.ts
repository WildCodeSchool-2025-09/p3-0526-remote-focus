import client from "../../../database/client";
import type { Rows } from "../../../database/client";
import type { Media } from "../../types/Media/Media.types";

//recherche par média
export async function findMediaByTitle(
  q: string,
  type: string | undefined,
  limit: number,
  offset: number,
): Promise<Media[]> {
  const params: unknown[] = [`%${q}%`];
  let typeClause = "";

  // "anime" n'est pas une valeur de la colonne type (movie/series) mais un flag séparé is_anime
  if (type === "anime") {
    typeClause = "AND m.is_anime = 1";
  } else if (type === "movie" || type === "series") {
    // La colonne media.type ne connaît que "movie"/"tv" (convention TMDB), jamais "series"
    typeClause = "AND m.type = ? AND m.is_anime = 0";
    params.push(type === "series" ? "tv" : type);
  }

  params.push(limit, offset);

  const [rows] = await client.query<Media[]>(
    `SELECT
      m.ID AS id,
      m.tmdb_id AS tmdbId,
      m.name,
      m.type,
      m.released_at AS releasedAt,
      m.duration,
      m.poster,
      m.synopsis,
      m.overall_rating AS overallRating,
      m.status,
      m.original_name AS originalName,
      m.original_language AS originalLanguage,
      m.pegi,
      m.is_anime AS isAnime,
      (SELECT genre.name FROM classify_as
        JOIN genre ON genre.ID = classify_as.ID_genre
        WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName
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
     ORDER BY
       CASE WHEN p.name LIKE ? THEN 0 ELSE 1 END,
       p.ID ASC
     LIMIT ? OFFSET ?`,
    [`%${q}%`, `${q}%`, limit, offset],
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

  if (type === "anime") {
    typeClause = "AND m.is_anime = 1";
  } else if (type === "movie" || type === "series") {
    // La colonne media.type ne connaît que "movie"/"tv" (convention TMDB), jamais "series"
    typeClause = "AND m.type = ? AND m.is_anime = 0";
    params.push(type === "series" ? "tv" : type);
  }

  const [rows] = await client.query<Rows>(
    `SELECT COUNT(*) as total FROM media m WHERE m.name LIKE ? ${typeClause}`,
    params,
  );

  return (rows as { total: number }[])[0].total;
}
