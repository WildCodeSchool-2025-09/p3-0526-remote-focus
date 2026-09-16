import databaseClient from "../../../database/client";

import type { Media } from "../../types/Media/Media.types";

const MEDIA_COLUMNS = `
  m.ID AS id, m.tmdb_id AS tmdbId, m.name, m.type,
  m.released_at AS releasedAt, m.duration, m.poster, m.synopsis,
  m.overall_rating AS overallRating, m.status,
  m.original_name AS originalName, m.original_language AS originalLanguage,
  m.pegi, m.is_anime AS isAnime
`;

class CatalogRepository {
  async readTopRated(
    type: "movie" | "tv" | "anime" | null,
    limit = 10,
  ): Promise<Media[]> {
    // Excluded 10/10 notes because they can be unrelevant
    const [rows] = await databaseClient.query<Media[]>(
      `SELECT ${MEDIA_COLUMNS},
        (SELECT genre.name FROM classify_as JOIN genre ON genre.ID = classify_as.ID_genre WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName
      FROM media AS m
      WHERE overall_rating < 10 AND (? IS NULL OR (? = 'anime' AND is_anime = TRUE) OR (? = 'movie' AND type = 'movie' AND is_anime = FALSE) OR (? = 'tv' AND type = 'tv' AND is_anime = FALSE))
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
        (SELECT genre.name FROM classify_as JOIN genre ON genre.ID = classify_as.ID_genre WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName
      FROM media AS m
      WHERE (released_at BETWEEN NOW() - INTERVAL 90 DAY AND NOW()) AND (? IS NULL OR (? = 'anime' AND is_anime = TRUE) OR (? = 'movie' AND type = 'movie' AND is_anime = FALSE) OR (? = 'tv' AND type = 'tv' AND is_anime = FALSE))
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
      WHERE classify_as.ID_genre = ? AND (? IS NULL OR (? = 'anime' AND is_anime = TRUE) OR (? = 'movie' AND type = 'movie' AND is_anime = FALSE) OR (? = 'tv' AND type = 'tv' AND is_anime = FALSE))
      ORDER BY m.overall_rating DESC LIMIT ?`,
      [genreId, type, type, type, type, limit],
    );
    return rows;
  }
}

export default new CatalogRepository();
