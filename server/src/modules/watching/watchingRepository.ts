import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

class WatchingRepository {
  async markMediaAsWatched(userId: number, mediaId: number) {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO media_user (ID_user, ID_media, viewed_at)
      VALUES (?, ?, NOW())`,
      [userId, mediaId],
    );
    return result.affectedRows;
  }

  async unmarkMediaAsWatched(userId: number, mediaId: number) {
    const [result] = await databaseClient.query<Result>(
      `DELETE FROM media_user 
      WHERE ID_user=? 
      AND ID_media=?`,
      [userId, mediaId],
    );
    return result.affectedRows;
  }

  async isMediaWatched(userId: number, mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT * FROM media_user 
        WHERE ID_user=? 
      AND ID_media=?`,
      [userId, mediaId],
    );
    return rows;
  }

  async markSeriesAsWatched(userId: number, seriesId: number) {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO episode_user (ID_user, ID_episode, viewed_at)
      SELECT ?, e.ID, NOW()
      FROM episode e
      JOIN season s ON e.ID_season = s.ID
      WHERE s.ID_media = ? 
      AND NOT EXISTS (
        SELECT eu.ID_user, eu.ID_episode
        FROM episode_user AS eu
        WHERE eu.ID_user = ? AND eu.ID_episode = e.ID)`,
      [userId, seriesId, userId],
    );
    return result.affectedRows;
  }

  async unmarkSeriesAsWatched(userId: number, seriesId: number) {
    const [result] = await databaseClient.query<Result>(
      `DELETE FROM episode_user
      WHERE ID_user = ?
      AND ID_episode IN (
        SELECT e.ID FROM episode AS e
        JOIN season AS s ON e.ID_season=s.ID
        WHERE s.ID_media = ?)`,
      [userId, seriesId],
    );
    return result.affectedRows;
  }

  async isFullyWatched(userId: number, mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(e.ID) AS total, COUNT(eu.ID_episode) AS watched
      FROM episode AS e 
      LEFT JOIN episode_user AS eu 
      ON (e.ID=eu.ID_episode AND eu.ID_user = ?)
      JOIN season AS s ON e.ID_season = s.ID
      WHERE s.ID_media = ?`,
      [userId, mediaId],
    );
    if (rows[0].total === 0 || rows[0].total > rows[0].watched) {
      return false;
    }
    return true;
  }

  async markSeasonAsWatched(userId: number, seasonId: number) {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO episode_user (ID_user, ID_episode, viewed_at)
      SELECT ?, e.ID, NOW()
      FROM episode e
      WHERE e.ID_season = ? 
      AND NOT EXISTS (
        SELECT eu.ID_user, eu.ID_episode
        FROM episode_user AS eu
        WHERE eu.ID_user = ? AND eu.ID_episode = e.ID)`,
      [userId, seasonId, userId],
    );
    return result.affectedRows;
  }

  async unmarkSeasonAsWatched(userId: number, seasonId: number) {
    const [result] = await databaseClient.query<Result>(
      `DELETE FROM episode_user
      WHERE ID_user = ?
      AND ID_episode IN (
        SELECT e.ID FROM episode AS e
        WHERE e.ID_season = ?)`,
      [userId, seasonId],
    );
    return result.affectedRows;
  }

  async isSeasonWatched(userId: number, seasonId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(e.ID) AS total, COUNT(eu.ID_episode) AS watched
      FROM episode AS e 
      LEFT JOIN episode_user AS eu 
      ON (e.ID=eu.ID_episode AND eu.ID_user = ?)
      WHERE e.ID_season = ?`,
      [userId, seasonId],
    );
    if (rows[0].total === 0 || rows[0].total > rows[0].watched) {
      return false;
    }
    return true;
  }

  async markEpisodeAsWatched(userId: number, episodeId: number) {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO episode_user (ID_user, ID_episode, viewed_at)
      VALUES (?, ?, NOW())`,
      [userId, episodeId],
    );
    return result.affectedRows;
  }

  async unmarkEpisodeAsWatched(userId: number, episodeId: number) {
    const [result] = await databaseClient.query<Result>(
      `DELETE FROM episode_user 
      WHERE ID_user=? 
      AND ID_episode=?`,
      [userId, episodeId],
    );
    return result.affectedRows;
  }

  async isEpisodeWatched(userId: number, episodeId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT * FROM episode_user 
        WHERE ID_user=? 
      AND ID_episode=?`,
      [userId, episodeId],
    );
    return rows;
  }

  async isWatched(
    userId: number,
    mediaId: number,
    type: "movie" | "tv" | "anime" | undefined,
  ) {
    if (type === "movie") {
      const movieWatched = await this.isMediaWatched(userId, mediaId);
      if (movieWatched.length > 0) {
        return true;
      }
      return false;
    }

    if (type === "tv" || type === "anime") {
      return await this.isFullyWatched(userId, mediaId);
    }
    return false;
  }
}

export default new WatchingRepository();
