import databaseClient, { type Rows } from "../../../database/client";

export type TrackState = {
  mediaId: number;
  isFavorite: boolean;
  isInWatchlist: boolean;
};

export type TrackedList = "favorite";
export type TrackedType = "movie" | "tv" | "anime" | null;

const TRACKED_LISTS = {
  favorite: { flag: "t.favorite_media = TRUE", dateColumn: "t.favorited_at" },
} as const;

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
  async read(userId: number, mediaId: number): Promise<TrackState | null> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        ID_media AS mediaId,
        favorite_media AS isFavorite,
        watchlist AS isInWatchlist
      FROM track
      WHERE ID_user = ? AND ID_media = ?`,
      [userId, mediaId],
    );

    const track = rows[0];

    if (track == null) {
      return null;
    }

    return {
      mediaId: Number(track.mediaId),
      isFavorite: Boolean(track.isFavorite),
      isInWatchlist: Boolean(track.isInWatchlist),
    };
  }

  async readAll(userId: number): Promise<TrackState[]> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        ID_media AS mediaId,
        favorite_media AS isFavorite,
        watchlist AS isInWatchlist
      FROM track
      WHERE ID_user = ?
        AND (favorite_media = TRUE OR watchlist = TRUE)`,
      [userId],
    );

    return rows.map((track) => ({
      mediaId: Number(track.mediaId),
      isFavorite: Boolean(track.isFavorite),
      isInWatchlist: Boolean(track.isInWatchlist),
    }));
  }

  async toggleFavorite(userId: number, mediaId: number): Promise<TrackState> {
    await databaseClient.query(
      `INSERT INTO track (
        ID_user,
        ID_media,
        favorite_media,
        user_rating,
        watchlist,
        favorited_at,
        watchlisted_at
      )
      VALUES (?, ?, TRUE, NULL, FALSE, NOW(), NULL)
      ON DUPLICATE KEY UPDATE
        favorited_at = IF(favorite_media, NULL, NOW()),
        favorite_media = NOT favorite_media`,
      [userId, mediaId],
    );

    const track = await this.read(userId, mediaId);

    if (track == null) {
      throw new Error("Impossible de récupérer le média.");
    }

    return track;
  }

  async toggleWatchlist(userId: number, mediaId: number): Promise<TrackState> {
    await databaseClient.query(
      `INSERT INTO track (
        ID_user,
        ID_media,
        favorite_media,
        user_rating,
        watchlist,
        favorited_at,
        watchlisted_at
      )
      VALUES (?, ?, FALSE, NULL, TRUE, NULL, NOW())
      ON DUPLICATE KEY UPDATE
        watchlisted_at = IF(watchlist, NULL, NOW()),
        watchlist = NOT watchlist`,
      [userId, mediaId],
    );

    const track = await this.read(userId, mediaId);

    if (track == null) {
      throw new Error("Impossible de récupérer le média.");
    }

    return track;
  }

  async countFavoriteMedias(userId: number): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total
      FROM track
      WHERE ID_user = ?
        AND favorite_media = TRUE`,
      [userId],
    );

    return Number(rows[0].total);
  }

  async countWatchlist(userId: number): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total
      FROM track
      WHERE ID_user = ?
        AND watchlist = TRUE`,
      [userId],
    );

    return Number(rows[0].total);
  }

  async browseTracked(
    userId: number,
    list: TrackedList,
    type: TrackedType,
    seen: boolean | null,
    limit: number,
    offset: number,
  ): Promise<Rows> {
    const { flag, dateColumn } = TRACKED_LISTS[list];
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
         AND ${flag}
         AND ${MEDIA_TYPE_FILTER}
         ${buildSeenFilter(seen)}
       ORDER BY ${dateColumn} DESC, t.ID_media DESC
       LIMIT ? OFFSET ?`,
      [userId, type, type, type, type, limit, offset],
    );
    return rows;
  }

  async countTrackedByFilters(
    userId: number,
    list: TrackedList,
    type: TrackedType,
    seen: boolean | null,
  ): Promise<number> {
    const { flag } = TRACKED_LISTS[list];
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total
       FROM track AS t
       JOIN media AS m ON m.ID = t.ID_media
       WHERE t.ID_user = ?
         AND ${flag}
         AND ${MEDIA_TYPE_FILTER}
         ${buildSeenFilter(seen)}`,
      [userId, type, type, type, type],
    );
    return Number(rows[0].total);
  }
}

export default new TrackRepository();
