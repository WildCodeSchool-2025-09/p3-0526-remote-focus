import type { RowDataPacket } from "mysql2";
import databaseClient from "../../../database/client";

import type { LikedGenre } from "../../types/Genre/Genre.types";
import type { Media } from "../../types/Media/Media.types";

const MEDIA_COLUMNS = `
  m.ID AS id, m.tmdb_id AS tmdbId, m.name, m.type,
  m.released_at AS releasedAt, m.duration, m.poster, m.synopsis,
  m.overall_rating AS overallRating, m.status,
  m.original_name AS originalName, m.original_language AS originalLanguage,
  m.pegi, m.is_anime AS isAnime
`;

const MEDIA_TYPE = `
(? IS NULL 
OR (? = 'anime' AND m.is_anime = TRUE) 
OR (? = 'movie' AND m.type = 'movie' AND m.is_anime = FALSE) 
OR (? = 'tv' AND m.type = 'tv' AND m.is_anime = FALSE))
`;

const GENRE_NAME = `
(SELECT genre.name FROM classify_as 
JOIN genre ON genre.ID = classify_as.ID_genre 
WHERE classify_as.ID_media = m.ID LIMIT 1) 
AS genreName
`;

class CatalogRepository {
  async readTopRated(
    type: "movie" | "tv" | "anime" | null,
    limit = 10,
  ): Promise<Media[]> {
    // Excluded 10/10 notes because they can be unrelevant
    const [rows] = await databaseClient.query<Media[]>(
      `SELECT ${MEDIA_COLUMNS},
${GENRE_NAME}
      FROM media AS m
      WHERE overall_rating < 10 AND ${MEDIA_TYPE}
      ORDER BY overall_rating DESC LIMIT ?`,
      [type, type, type, type, limit],
    );
    return rows;
  }

  async readLatest90Days(
    type: "movie" | "tv" | "anime" | null,
    limit = 10,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      `SELECT ${MEDIA_COLUMNS},
       ${GENRE_NAME}
      FROM media AS m
      WHERE (released_at BETWEEN NOW() - INTERVAL 90 DAY AND NOW()) AND ${MEDIA_TYPE}
      ORDER BY released_at DESC LIMIT ?`,
      [type, type, type, type, limit],
    );
    return rows;
  }

  async readTopByGenre(
    genreId: number,
    type: "movie" | "tv" | "anime" | null,
    limit = 10,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      `SELECT ${MEDIA_COLUMNS}, genre.name AS genreName
      FROM media AS m
      JOIN classify_as ON m.ID = classify_as.ID_media
      JOIN genre ON genre.ID = classify_as.ID_genre
      WHERE classify_as.ID_genre = ? AND ${MEDIA_TYPE}
      ORDER BY m.overall_rating DESC LIMIT ?`,
      [genreId, type, type, type, type, limit],
    );
    return rows;
  }

  async readByFilters(
    type: "movie" | "tv" | "anime" | null,
    genreIds: number[] | null,
    limit: number,
    offset: number,
  ): Promise<Media[]> {
    const genrePlaceHolders = genreIds
      ? genreIds.map(() => "?").join(", ")
      : "";
    const [rows] = await databaseClient.query<Media[]>(
      `SELECT DISTINCT ${MEDIA_COLUMNS}, ${GENRE_NAME}
      FROM media AS m
      JOIN classify_as ON m.ID = classify_as.ID_media
      WHERE ${MEDIA_TYPE}
      ${genreIds ? `AND (classify_as.ID_genre IN (${genrePlaceHolders}))` : ""}
      ORDER BY m.overall_rating DESC LIMIT ? OFFSET ?
      `,
      [type, type, type, type, ...(genreIds ?? []), limit, offset],
    );
    return rows;
  }

  async countByFilters(
    type: "movie" | "tv" | "anime" | null,
    genreIds: number[] | null,
  ): Promise<number> {
    const genrePlaceHolders = genreIds
      ? genreIds.map(() => "?").join(", ")
      : "";
    const [rows] = await databaseClient.query<
      (RowDataPacket & { total: number })[]
    >(
      `SELECT COUNT(DISTINCT m.ID) AS total
      FROM media AS m
      JOIN classify_as ON m.ID = classify_as.ID_media
      WHERE ${MEDIA_TYPE} 
      ${genreIds ? `AND (classify_as.ID_genre IN (${genrePlaceHolders}))` : ""}`,
      [type, type, type, type, ...(genreIds ?? [])],
    );
    return rows[0].total;
  }

  async readGenres(): Promise<LikedGenre[]> {
    const [rows] = await databaseClient.query<LikedGenre[]>(
      `SELECT ID AS id, name
    FROM genre 
    ORDER BY name`,
    );
    return rows;
  }
}

export default new CatalogRepository();
