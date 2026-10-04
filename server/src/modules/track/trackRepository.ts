import databaseClient, { type Rows } from "../../../database/client";

export type WatchlistType = "movie" | "tv" | "anime" | null;

const MEDIA_TYPE_FILTER = `
  (? IS NULL
    OR (? = 'anime' AND m.is_anime = TRUE)
    OR (? = 'movie' AND m.type = 'movie' AND m.is_anime = FALSE)
    OR (? = 'tv' AND m.type = 'tv' AND m.is_anime = FALSE))
`;

function buildSeenFilter(seen: boolean | null): string {
  if (seen === null) {
    return "";
  }

  return `AND ${seen ? "" : "NOT "}EXISTS (
    SELECT 1 FROM media_user AS mu
    WHERE mu.ID_media = m.ID AND mu.ID_user = t.ID_user
  )`;
}

class TrackRepository {
  async countFavoriteMedias(userId: number): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT COUNT(*) AS total FROM track WHERE ID_user = ? AND favorite_media = 1",
      [userId],
    );
    return Number(rows[0].total);
  }

  async countWatchlist(userId: number): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT COUNT(*) AS total FROM track WHERE ID_user = ? AND watchlist = 1",
      [userId],
    );
    return Number(rows[0].total);
  }

  async browseWatchlist(
    userId: number,
    type: WatchlistType,
    seen: boolean | null,
    limit: number,
    offset: number,
  ): Promise<Rows> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
         m.ID, m.tmdb_id, m.name, m.type, m.released_at, m.duration,
         m.poster, m.synopsis, m.overall_rating, m.status,
         m.original_name, m.original_language, m.pegi, m.is_anime,
         (SELECT genre.name FROM classify_as
           JOIN genre ON genre.ID = classify_as.ID_genre
           WHERE classify_as.ID_media = m.ID LIMIT 1) AS genre_name
       FROM track AS t
       JOIN media AS m ON m.ID = t.ID_media
       WHERE t.ID_user = ?
         AND t.watchlist = 1
         AND ${MEDIA_TYPE_FILTER}
         ${buildSeenFilter(seen)}
       ORDER BY t.added_at DESC
       LIMIT ? OFFSET ?`,
      [userId, type, type, type, type, limit, offset],
    );
    return rows;
  }

  async countWatchlistByFilters(
    userId: number,
    type: WatchlistType,
    seen: boolean | null,
  ): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total
       FROM track AS t
       JOIN media AS m ON m.ID = t.ID_media
       WHERE t.ID_user = ?
         AND t.watchlist = 1
         AND ${MEDIA_TYPE_FILTER}
         ${buildSeenFilter(seen)}`,
      [userId, type, type, type, type],
    );
    return Number(rows[0].total);
  }
}

export default new TrackRepository();
