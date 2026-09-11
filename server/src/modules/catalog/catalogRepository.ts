import databaseClient, { type Rows } from "../../../database/client";

import type { Media } from "../../types/Media/Media.types";

class CatalogRepository {
  async readTopRated(
    type: "movie" | "tv" | "anime" | null,
    limit = 10,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      "SELECT ID AS id, tmdb_id AS tmdbId, name, type, released_at AS releasedAt, duration, poster, synopsis, overall_rating AS overallRating, status, original_name AS originalName, original_language AS originalLanguage, pegi, is_anime AS isAnime, ( SELECT genre.name FROM classify_as JOIN genre ON genre.ID = classify_as.ID_genre WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName FROM media AS m WHERE (? IS NULL OR (? = 'anime' AND is_anime = TRUE) OR (? = 'movie' AND type = 'movie' AND is_anime = FALSE) OR (? = 'tv' AND type = 'tv' AND is_anime = FALSE)) ORDER BY overall_rating DESC LIMIT ?",
      [type, type, type, type, limit],
    );
    return rows;
  }

  async readLatest30Days(
    type: "movie" | "tv" | "anime" | null,
    limit = 10,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      "SELECT ID AS id, tmdb_id AS tmdbId, name, type, released_at AS releasedAt, duration, poster, synopsis, overall_rating AS overallRating, status, original_name AS originalName, original_language AS originalLanguage, pegi, is_anime AS isAnime, (SELECT genre.name FROM classify_as JOIN genre ON genre.ID = classify_as.ID_genre WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName FROM media AS m WHERE (released_at BETWEEN NOW() - INTERVAL 30 DAY AND NOW()) AND (? IS NULL OR (? = 'anime' AND is_anime = TRUE) OR (? = 'movie' AND type = 'movie' AND is_anime = FALSE) OR (? = 'tv' AND type = 'tv' AND is_anime = FALSE)) ORDER BY released_at DESC LIMIT ?",
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

  private buildFilterClause(
    type: "movie" | "tv" | "anime" | null,
    genreIds: number[],
  ) {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (type != null) {
      if (type === "anime") {
        conditions.push("m.is_anime = TRUE");
      } else {
        conditions.push("m.type = ? AND m.is_anime = FALSE");
        params.push(type);
      }
    }

    if (genreIds.length > 0) {
      conditions.push(
        "m.ID IN (SELECT ID_media FROM classify_as WHERE ID_genre IN (?))",
      );
      params.push(genreIds);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    return { whereClause, params };
  }

  async readByFilters(
    type: "movie" | "tv" | "anime" | null,
    genreIds: number[],
    offset: number,
    limit: number,
  ): Promise<Media[]> {
    const { whereClause, params } = this.buildFilterClause(type, genreIds);

    const [rows] = await databaseClient.query<Media[]>(
      `SELECT m.ID AS id, m.tmdb_id AS tmdbId, m.name, m.type, m.released_at AS releasedAt, m.duration, m.poster, m.synopsis, m.overall_rating AS overallRating, m.status, m.original_name AS originalName, m.original_language AS originalLanguage, m.pegi, m.is_anime AS isAnime, (SELECT genre.name FROM classify_as JOIN genre ON genre.ID = classify_as.ID_genre WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName
       FROM media AS m
       ${whereClause}
       ORDER BY m.overall_rating DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    return rows;
  }

  async countByFilters(
    type: "movie" | "tv" | "anime" | null,
    genreIds: number[],
  ): Promise<number> {
    const { whereClause, params } = this.buildFilterClause(type, genreIds);

    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total FROM media AS m ${whereClause}`,
      params,
    );
    return (rows as { total: number }[])[0].total;
  }
}

export default new CatalogRepository();
