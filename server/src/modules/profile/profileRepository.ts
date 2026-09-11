import databaseClient, { type Rows } from "../../../database/client";

class ProfileRepository {
  async countWatchedTitles(userId: number): Promise<number> {
    const [movieRows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total
       FROM media_user AS mu
       JOIN media AS m ON m.ID = mu.ID_media
       WHERE mu.ID_user = ? AND m.type = 'movie'`,
      [userId],
    );

    const [seriesRows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total FROM (
         SELECT s.ID_media
         FROM season AS s
         JOIN episode AS e ON e.ID_season = s.ID
         GROUP BY s.ID_media
         HAVING COUNT(e.ID) = SUM(
           CASE WHEN EXISTS(
             SELECT 1 FROM episode_user AS eu WHERE eu.ID_episode = e.ID AND eu.ID_user = ?
           ) THEN 1 ELSE 0 END
         )
       ) AS fullyWatchedSeries`,
      [userId],
    );

    return (
      Number((movieRows as { total: number }[])[0].total) +
      Number((seriesRows as { total: number }[])[0].total)
    );
  }
}

export default new ProfileRepository();
