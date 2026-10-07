import databaseClient, { type Rows } from "../../../database/client";

class StatisticsRepository {
  async countWatchedTitles(userId: number): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT COUNT(*) AS total FROM media_user WHERE ID_user = ?",
      [userId],
    );

    return Number(rows[0].total);
  }
}

export default new StatisticsRepository();
