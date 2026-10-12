import databaseClient, { type Rows } from "../../../database/client";
import type { Media } from "../../types/Media/Media.types";

export interface PersonSearchRow extends Rows {
  id: number;
  name: string;
  photo: string | null;
}

const buildGenreClause = (genreIds: number[] | undefined) => {
  if (!genreIds || genreIds.length === 0) {
    return { clause: "", params: [] };
  }

  const placeholders = genreIds.map(() => "?").join(", ");

  return {
    clause: `AND EXISTS (SELECT 1 FROM classify_as ca WHERE ca.ID_media = m.ID AND ca.ID_genre IN (${placeholders}))`,
    params: genreIds,
  };
};

class SearchRepository {
  async findMediaByTitle(
    q: string,
    type: string | undefined,
    genreIds: number[] | undefined,
    limit: number,
    offset: number,
  ): Promise<Media[]> {
    const params: unknown[] = [`%${q}%`];
    let typeClause = "";

    if (type === "anime") {
      typeClause = "AND m.is_anime = 1";
    } else if (type === "movie" || type === "tv") {
      typeClause = "AND m.type = ? AND m.is_anime = 0";
      params.push(type);
    }

    const genre = buildGenreClause(genreIds);
    params.push(...genre.params, `${q}%`, limit, offset);

    const [rows] = await databaseClient.query<Media[]>(
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
      WHERE m.name LIKE ? ${typeClause} ${genre.clause}
      ORDER BY
        CASE WHEN m.name LIKE ? THEN 0 ELSE 1 END,
        m.name ASC
      LIMIT ? OFFSET ?`,
      params,
    );

    return rows;
  }

  async findPersonByName(
    q: string,
    limit: number,
    offset: number,
  ): Promise<PersonSearchRow[]> {
    const [rows] = await databaseClient.query<PersonSearchRow[]>(
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

  async countMediaByTitle(
    q: string,
    type: string | undefined,
    genreIds: number[] | undefined,
  ): Promise<number> {
    const params: unknown[] = [`%${q}%`];
    let typeClause = "";

    if (type === "anime") {
      typeClause = "AND m.is_anime = 1";
    } else if (type === "movie" || type === "tv") {
      typeClause = "AND m.type = ? AND m.is_anime = 0";
      params.push(type);
    }

    const genre = buildGenreClause(genreIds);
    params.push(...genre.params);

    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) as total FROM media m WHERE m.name LIKE ? ${typeClause} ${genre.clause}`,
      params,
    );

    return (rows as { total: number }[])[0].total;
  }
}

export default new SearchRepository();
