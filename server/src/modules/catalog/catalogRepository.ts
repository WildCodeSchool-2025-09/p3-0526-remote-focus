import databaseClient from "../../../database/client";

import type { Media } from "../../types/Media/Media.types";

class CatalogRepository {
  async readTopRated(
    type: "movie" | "tv" | "anime" | null,
    limit = 10,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      "SELECT ID AS id, tmdb_id AS tmdbId, name, type, released_at AS releasedAt, duration, poster, synopsis, overall_rating AS overallRating, status, original_name AS originalName, original_language AS originalLanguage, pegi, is_anime AS isAnime, ( SELECT genre.name FROM classify_as JOIN genre ON genre.ID = classify_as.ID_genre WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName FROM media AS m WHERE overall_rating < 10 AND (? IS NULL OR (? = 'anime' AND is_anime = TRUE) OR (? = 'movie' AND type = 'movie' AND is_anime = FALSE) OR (? = 'tv' AND type = 'tv' AND is_anime = FALSE)) ORDER BY overall_rating DESC LIMIT ?",
      [type, type, type, type, limit],
    );
    return rows;
  }

  async readLatest90Days(
    type: "movie" | "tv" | "anime" | null,
    limit = 10,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      "SELECT ID AS id, tmdb_id AS tmdbId, name, type, released_at AS releasedAt, duration, poster, synopsis, overall_rating AS overallRating, status, original_name AS originalName, original_language AS originalLanguage, pegi, is_anime AS isAnime, (SELECT genre.name FROM classify_as JOIN genre ON genre.ID = classify_as.ID_genre WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName FROM media AS m WHERE (released_at BETWEEN NOW() - INTERVAL 90 DAY AND NOW()) AND (? IS NULL OR (? = 'anime' AND is_anime = TRUE) OR (? = 'movie' AND type = 'movie' AND is_anime = FALSE) OR (? = 'tv' AND type = 'tv' AND is_anime = FALSE)) ORDER BY released_at DESC LIMIT ?",
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
      "SELECT media.ID AS id, media.tmdb_id AS tmdbId, media.name, media.type, media.released_at AS releasedAt, media.duration, media.poster, media.synopsis, media.overall_rating AS overallRating, media.status, media.original_name AS originalName, media.original_language AS originalLanguage, media.pegi, media.is_anime AS isAnime, genre.name AS genreName FROM media JOIN classify_as ON media.ID = classify_as.ID_media JOIN genre ON genre.ID = classify_as.ID_genre WHERE classify_as.ID_genre = ? AND (? IS NULL OR (? = 'anime' AND is_anime = TRUE) OR (? = 'movie' AND type = 'movie' AND is_anime = FALSE) OR (? = 'tv' AND type = 'tv' AND is_anime = FALSE)) ORDER BY media.overall_rating DESC LIMIT ?",
      [genreId, type, type, type, type, limit],
    );
    return rows;
  }
}

export default new CatalogRepository();
