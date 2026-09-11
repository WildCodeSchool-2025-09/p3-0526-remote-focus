import databaseClient, { type Rows } from "../../../database/client";
import type { Media } from "../../types/Media/Media.types";
import { PEGI16_VALUES, pegiFilterClause } from "../../utils/applyPegiFilter";
import { isWatchedClause } from "../../utils/isWatchedClause";

const NOT_WATCHED_CLAUSE = `NOT (${isWatchedClause()})`;

const MEDIA_COLUMNS = `m.ID AS id, m.tmdb_id AS tmdbId, m.name, m.type, m.released_at AS releasedAt,
  m.duration, m.poster, m.synopsis, m.overall_rating AS overallRating, m.status,
  m.original_name AS originalName, m.original_language AS originalLanguage,
  m.pegi, m.is_anime AS isAnime,
  (SELECT genre.name FROM classify_as JOIN genre ON genre.ID = classify_as.ID_genre
   WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName`;

class SuggestionRepository {
  async countWatchedMovies(userId: number): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT COUNT(*) AS total FROM media_user WHERE ID_user = ?",
      [userId],
    );
    return Number((rows as { total: number }[])[0].total);
  }

  async readMostWatchedGenreIds(
    userId: number,
    limit: number,
  ): Promise<number[]> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT ca.ID_genre AS id, COUNT(*) AS total
       FROM media_user AS mu
       JOIN classify_as AS ca ON ca.ID_media = mu.ID_media
       WHERE mu.ID_user = ?
       GROUP BY ca.ID_genre
       ORDER BY total DESC
       LIMIT ?`,
      [userId, limit],
    );
    return rows.map((row) => row.id as number);
  }

  async readByGenres(
    userId: number,
    genreIds: number[],
    hidePegi16: boolean,
    minRating: number,
    limit: number,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      `SELECT ${MEDIA_COLUMNS}
       FROM media AS m
       WHERE m.ID IN (SELECT ID_media FROM classify_as WHERE ID_genre IN (?))
         AND m.overall_rating > ?
         AND ${pegiFilterClause()}
         AND ${NOT_WATCHED_CLAUSE}
       ORDER BY m.overall_rating DESC
       LIMIT ?`,
      [genreIds, minRating, hidePegi16, PEGI16_VALUES, userId, userId, limit],
    );
    return rows;
  }

  async readByActors(
    userId: number,
    actorIds: number[],
    hidePegi16: boolean,
    minRating: number,
    limit: number,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      `SELECT DISTINCT ${MEDIA_COLUMNS}
       FROM media AS m
       WHERE (
         m.ID IN (SELECT ID_media FROM media_person WHERE ID_person IN (?) AND role = 'actor')
         OR m.ID IN (
           SELECT s.ID_media FROM season AS s
           JOIN episode AS e ON e.ID_season = s.ID
           JOIN episode_person AS ep ON ep.ID_episode = e.ID
           WHERE ep.ID_person IN (?) AND ep.role = 'actor'
         )
       )
         AND m.overall_rating > ?
         AND ${pegiFilterClause()}
         AND ${NOT_WATCHED_CLAUSE}
       ORDER BY m.overall_rating DESC
       LIMIT ?`,
      [
        actorIds,
        actorIds,
        minRating,
        hidePegi16,
        PEGI16_VALUES,
        userId,
        userId,
        limit,
      ],
    );
    return rows;
  }
}

export default new SuggestionRepository();
