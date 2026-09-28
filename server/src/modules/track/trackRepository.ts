import databaseClient from "../../../database/client";

import type { Rows } from "../../../database/client";

export type TrackState = {
  mediaId: number;
  isFavorite: boolean;
  isInWatchlist: boolean;
};

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
        watchlist
      )
      VALUES (?, ?, TRUE, NULL, FALSE)
      ON DUPLICATE KEY UPDATE
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
        watchlist
      )
      VALUES (?, ?, FALSE, NULL, TRUE)
      ON DUPLICATE KEY UPDATE
        watchlist = NOT watchlist`,
      [userId, mediaId],
    );

    const track = await this.read(userId, mediaId);

    if (track == null) {
      throw new Error("Impossible de récupérer le média.");
    }

    return track;
  }
}

export default new TrackRepository();
