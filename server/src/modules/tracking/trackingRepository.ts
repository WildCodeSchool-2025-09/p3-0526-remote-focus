import databaseClient, { type Rows } from "../../../database/client";

class TrackingRepository {
  async markMediaAsWatched(userId: number, mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `INSERT INTO media_user (ID_user, ID_media, viewed_at)
      VALUES (?, ?, NOW())`,
      [userId, mediaId],
    );
    return rows;
  }
  async unmarkMediaAsWatched(userId: number, mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `DELETE FROM media_user 
      WHERE ID_user=? 
      AND ID_media=?`,
      [userId, mediaId],
    );
    return rows;
  }

  async markSeriesAsWatched(userId: number, seriesId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        `,
    );
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
}

export default new TrackingRepository();
