import databaseClient, { type Rows } from "../../../database/client";

class StatisticsRepository {
  async countWatchedTitles(userId: number): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT COUNT(*) AS total FROM media_user WHERE ID_user = ?",
      [userId],
    );

    return Number(rows[0].total);
  }

  async sumWatchedDuration(userId: number): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
         (SELECT COALESCE(SUM(m.duration), 0)
          FROM media_user AS mu
          JOIN media AS m ON m.ID = mu.ID_media
          WHERE mu.ID_user = ?)
         +
         (SELECT COALESCE(SUM(e.duration), 0)
          FROM episode_user AS eu
          JOIN episode AS e ON e.ID = eu.ID_episode
          JOIN season AS s ON s.ID = e.ID_season
          WHERE eu.ID_user = ?
            AND NOT EXISTS (
              SELECT 1 FROM media_user AS mu2
              WHERE mu2.ID_user = eu.ID_user AND mu2.ID_media = s.ID_media
            )
         ) AS total`,
      [userId, userId],
    );

    return Number(rows[0].total);
  }
}

export default new StatisticsRepository();
