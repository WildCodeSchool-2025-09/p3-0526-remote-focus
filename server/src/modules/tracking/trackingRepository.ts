import databaseClient, { type Rows } from "../../../database/client";

class TrackingRepository {
  async seasonExists(seasonId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT ID FROM season WHERE ID = ?",
      [seasonId],
    );
    return rows.length > 0;
  }

  async episodeExists(episodeId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT ID FROM episode WHERE ID = ?",
      [episodeId],
    );
    return rows.length > 0;
  }

  async isMovieWatched(userId: number, mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT 1 FROM media_user WHERE ID_user = ? AND ID_media = ?",
      [userId, mediaId],
    );
    return rows.length > 0;
  }

  async markMovieAsWatched(userId: number, mediaId: number) {
    await databaseClient.query(
      "INSERT IGNORE INTO media_user (ID_user, ID_media, viewed_at) VALUES (?, ?, NOW())",
      [userId, mediaId],
    );
  }

  async unmarkMovieAsWatched(userId: number, mediaId: number) {
    await databaseClient.query(
      "DELETE FROM media_user WHERE ID_user = ? AND ID_media = ?",
      [userId, mediaId],
    );
  }

  async isEpisodeWatched(userId: number, episodeId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT 1 FROM episode_user WHERE ID_user = ? AND ID_episode = ?",
      [userId, episodeId],
    );
    return rows.length > 0;
  }

  async markEpisodeAsWatched(userId: number, episodeId: number) {
    await databaseClient.query(
      "INSERT IGNORE INTO episode_user (ID_user, ID_episode, viewed_at) VALUES (?, ?, NOW())",
      [userId, episodeId],
    );
  }

  async unmarkEpisodeAsWatched(userId: number, episodeId: number) {
    await databaseClient.query(
      "DELETE FROM episode_user WHERE ID_user = ? AND ID_episode = ?",
      [userId, episodeId],
    );
  }

  async markSeriesAsWatched(userId: number, mediaId: number) {
    await databaseClient.query(
      `INSERT IGNORE INTO episode_user (ID_user, ID_episode, viewed_at)
       SELECT ?, e.ID, NOW()
       FROM episode AS e
       JOIN season AS s ON s.ID = e.ID_season
       WHERE s.ID_media = ?`,
      [userId, mediaId],
    );
  }

  async unmarkSeriesAsWatched(userId: number, mediaId: number) {
    await databaseClient.query(
      `DELETE eu FROM episode_user AS eu
       JOIN episode AS e ON e.ID = eu.ID_episode
       JOIN season AS s ON s.ID = e.ID_season
       WHERE eu.ID_user = ? AND s.ID_media = ?`,
      [userId, mediaId],
    );
  }

  async markSeasonAsWatched(userId: number, seasonId: number) {
    await databaseClient.query(
      `INSERT IGNORE INTO episode_user (ID_user, ID_episode, viewed_at)
       SELECT ?, e.ID, NOW()
       FROM episode AS e
       WHERE e.ID_season = ?`,
      [userId, seasonId],
    );
  }

  async unmarkSeasonAsWatched(userId: number, seasonId: number) {
    await databaseClient.query(
      `DELETE eu FROM episode_user AS eu
       JOIN episode AS e ON e.ID = eu.ID_episode
       WHERE eu.ID_user = ? AND e.ID_season = ?`,
      [userId, seasonId],
    );
  }

  async isSeriesFullyWatched(userId: number, mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
         (SELECT COUNT(*) FROM episode AS e JOIN season AS s ON s.ID = e.ID_season WHERE s.ID_media = ?) AS total,
         (SELECT COUNT(*) FROM episode_user AS eu
          JOIN episode AS e ON e.ID = eu.ID_episode
          JOIN season AS s ON s.ID = e.ID_season
          WHERE s.ID_media = ? AND eu.ID_user = ?) AS watched`,
      [mediaId, mediaId, userId],
    );
    const { total, watched } = rows[0] as { total: number; watched: number };
    return total > 0 && total === watched;
  }

  async isSeasonFullyWatched(userId: number, seasonId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
         (SELECT COUNT(*) FROM episode WHERE ID_season = ?) AS total,
         (SELECT COUNT(*) FROM episode_user AS eu
          JOIN episode AS e ON e.ID = eu.ID_episode
          WHERE e.ID_season = ? AND eu.ID_user = ?) AS watched`,
      [seasonId, seasonId, userId],
    );
    const { total, watched } = rows[0] as { total: number; watched: number };
    return total > 0 && total === watched;
  }

  async readWatchedEpisodeIds(userId: number, seasonId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT eu.ID_episode AS id
       FROM episode_user AS eu
       JOIN episode AS e ON e.ID = eu.ID_episode
       WHERE e.ID_season = ? AND eu.ID_user = ?`,
      [seasonId, userId],
    );
    return new Set(rows.map((row) => row.id as number));
  }
}

export default new TrackingRepository();
