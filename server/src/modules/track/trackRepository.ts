import databaseClient, { type Rows } from "../../../database/client";
import type { Media } from "../../types/Media/Media.types";
import { PEGI16_VALUES, pegiFilterClause } from "../../utils/applyPegiFilter";
import { isWatchedClause } from "../../utils/isWatchedClause";

type MediaTypeFilter = "movie" | "tv" | "anime" | null;
type WatchedFilter = "watched" | "to-watch" | null;

type TrackedMedia = Media & {
  isWatched: boolean;
  userRating: number | string | null;
};

type WatchlistMedia = TrackedMedia & {
  watchlistAddedAt: Date | string | null;
};

const TYPE_FILTER_CLAUSE = `(? IS NULL
  OR (? = 'anime' AND m.is_anime = TRUE)
  OR (? = 'movie' AND m.type = 'movie' AND m.is_anime = FALSE)
  OR (? = 'tv' AND m.type = 'tv' AND m.is_anime = FALSE))`;

const PEGI_FILTER_CLAUSE = pegiFilterClause();

const GENRE_NAME_SUBQUERY = `(SELECT genre.name FROM classify_as
  JOIN genre ON genre.ID = classify_as.ID_genre
  WHERE classify_as.ID_media = m.ID LIMIT 1)`;

const IS_WATCHED_CASE = `${isWatchedClause()} AS isWatched`;

class TrackRepository {
  async mediaExists(mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT ID FROM media WHERE ID = ?",
      [mediaId],
    );
    return rows.length > 0;
  }

  async readTrack(userId: number, mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT favorite_media, watchlist, user_rating FROM track WHERE ID_user = ? AND ID_media = ?",
      [userId, mediaId],
    );
    return rows[0] ?? null;
  }

  async toggleFavorite(userId: number, mediaId: number) {
    const existing = await this.readTrack(userId, mediaId);
    const nextValue = !(existing != null && Boolean(existing.favorite_media));

    await databaseClient.query(
      `INSERT INTO track (ID_user, ID_media, favorite_media, favorited_at, watchlist)
       VALUES (?, ?, ?, ?, FALSE)
       ON DUPLICATE KEY UPDATE
         favorite_media = VALUES(favorite_media),
         favorited_at = VALUES(favorited_at)`,
      [userId, mediaId, nextValue, nextValue ? new Date() : null],
    );

    return nextValue;
  }

  async toggleWatchlist(userId: number, mediaId: number) {
    const existing = await this.readTrack(userId, mediaId);
    const nextValue = !(existing != null && Boolean(existing.watchlist));

    await databaseClient.query(
      `INSERT INTO track (ID_user, ID_media, favorite_media, watchlist, watchlist_added_at)
       VALUES (?, ?, FALSE, ?, ?)
       ON DUPLICATE KEY UPDATE
         watchlist = VALUES(watchlist),
         watchlist_added_at = VALUES(watchlist_added_at)`,
      [userId, mediaId, nextValue, nextValue ? new Date() : null],
    );

    return nextValue;
  }

  async upsertRating(userId: number, mediaId: number, rating: number | null) {
    await databaseClient.query(
      `INSERT INTO track (ID_user, ID_media, favorite_media, watchlist, user_rating)
       VALUES (?, ?, FALSE, FALSE, ?)
       ON DUPLICATE KEY UPDATE user_rating = VALUES(user_rating)`,
      [userId, mediaId, rating],
    );
  }

  async readTrackedGenreIds(userId: number): Promise<number[]> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT DISTINCT ca.ID_genre AS id
       FROM track AS t
       JOIN classify_as AS ca ON ca.ID_media = t.ID_media
       WHERE t.ID_user = ? AND (t.favorite_media = TRUE OR t.watchlist = TRUE)`,
      [userId],
    );
    return rows.map((row) => row.id as number);
  }

  async browseFavorites(
    userId: number,
    type: MediaTypeFilter,
    hidePegi16: boolean,
    offset: number,
    limit: number,
  ): Promise<TrackedMedia[]> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT m.ID AS id, m.tmdb_id AS tmdbId, m.name, m.type, m.released_at AS releasedAt,
              m.duration, m.poster, m.synopsis, m.overall_rating AS overallRating, m.status,
              m.original_name AS originalName, m.original_language AS originalLanguage,
              m.pegi, m.is_anime AS isAnime, ${GENRE_NAME_SUBQUERY} AS genreName,
              t.user_rating AS userRating,
              ${IS_WATCHED_CASE}
       FROM track AS t
       JOIN media AS m ON m.ID = t.ID_media
       WHERE t.ID_user = ? AND t.favorite_media = TRUE AND ${TYPE_FILTER_CLAUSE}
         AND ${PEGI_FILTER_CLAUSE}
       ORDER BY t.favorited_at DESC
       LIMIT ? OFFSET ?`,
      [
        userId,
        userId,
        userId,
        type,
        type,
        type,
        type,
        hidePegi16,
        PEGI16_VALUES,
        limit,
        offset,
      ],
    );
    return (rows as unknown as TrackedMedia[]).map((row) => ({
      ...row,
      isWatched: Boolean(row.isWatched),
    }));
  }

  async countFavorites(
    userId: number,
    type: MediaTypeFilter,
    hidePegi16: boolean,
  ): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total
       FROM track AS t
       JOIN media AS m ON m.ID = t.ID_media
       WHERE t.ID_user = ? AND t.favorite_media = TRUE AND ${TYPE_FILTER_CLAUSE}
         AND ${PEGI_FILTER_CLAUSE}`,
      [userId, type, type, type, type, hidePegi16, PEGI16_VALUES],
    );
    return Number((rows as { total: number }[])[0].total);
  }

  async browseWatchlist(
    userId: number,
    type: MediaTypeFilter,
    hidePegi16: boolean,
    watchedFilter: WatchedFilter,
    offset: number,
    limit: number,
  ): Promise<WatchlistMedia[]> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT * FROM (
         SELECT m.ID AS id, m.tmdb_id AS tmdbId, m.name, m.type, m.released_at AS releasedAt,
                m.duration, m.poster, m.synopsis, m.overall_rating AS overallRating, m.status,
                m.original_name AS originalName, m.original_language AS originalLanguage,
                m.pegi, m.is_anime AS isAnime, ${GENRE_NAME_SUBQUERY} AS genreName,
                t.watchlist_added_at AS watchlistAddedAt,
                t.user_rating AS userRating,
                ${IS_WATCHED_CASE}
         FROM track AS t
         JOIN media AS m ON m.ID = t.ID_media
         WHERE t.ID_user = ? AND t.watchlist = TRUE AND ${TYPE_FILTER_CLAUSE}
           AND ${PEGI_FILTER_CLAUSE}
       ) AS w
       WHERE (? IS NULL OR (? = 'watched' AND isWatched = 1) OR (? = 'to-watch' AND isWatched = 0))
       ORDER BY watchlistAddedAt DESC
       LIMIT ? OFFSET ?`,
      [
        userId,
        userId,
        userId,
        type,
        type,
        type,
        type,
        hidePegi16,
        PEGI16_VALUES,
        watchedFilter,
        watchedFilter,
        watchedFilter,
        limit,
        offset,
      ],
    );
    return (rows as unknown as WatchlistMedia[]).map((row) => ({
      ...row,
      isWatched: Boolean(row.isWatched),
    }));
  }

  async countWatchlist(
    userId: number,
    type: MediaTypeFilter,
    hidePegi16: boolean,
    watchedFilter: WatchedFilter,
  ): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total FROM (
         SELECT
                ${IS_WATCHED_CASE}
         FROM track AS t
         JOIN media AS m ON m.ID = t.ID_media
         WHERE t.ID_user = ? AND t.watchlist = TRUE AND ${TYPE_FILTER_CLAUSE}
           AND ${PEGI_FILTER_CLAUSE}
       ) AS w
       WHERE (? IS NULL OR (? = 'watched' AND isWatched = 1) OR (? = 'to-watch' AND isWatched = 0))`,
      [
        userId,
        userId,
        userId,
        type,
        type,
        type,
        type,
        hidePegi16,
        PEGI16_VALUES,
        watchedFilter,
        watchedFilter,
        watchedFilter,
      ],
    );
    return Number((rows as { total: number }[])[0].total);
  }
}

export default new TrackRepository();
