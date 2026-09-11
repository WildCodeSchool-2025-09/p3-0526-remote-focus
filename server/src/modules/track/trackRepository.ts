import databaseClient, { type Rows } from "../../../database/client";

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
      "SELECT favorite_media, watchlist FROM track WHERE ID_user = ? AND ID_media = ?",
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
}

export default new TrackRepository();
