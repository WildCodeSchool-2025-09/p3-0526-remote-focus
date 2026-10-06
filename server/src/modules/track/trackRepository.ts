import databaseClient, { type Rows } from "../../../database/client";

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
}

export default new TrackRepository();
