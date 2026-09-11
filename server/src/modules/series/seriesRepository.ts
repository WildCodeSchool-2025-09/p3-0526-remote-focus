import databaseClient, { type Rows } from "../../../database/client";

class SeriesRepository {
  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT ID, name, original_name, poster, synopsis,
              released_at, overall_rating, original_language, pegi, status
       FROM media
       WHERE ID = ? AND type = ?`,
      [id, "tv"],
    );
    return rows[0] ?? null;
  }

  async readSeasons(mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT s.ID, s.name, s.number, s.poster, s.released_at, s.is_finished,
              COUNT(e.ID) AS episodeCount
       FROM season AS s
       LEFT JOIN episode AS e ON e.ID_season = s.ID
       WHERE s.ID_media = ?
       GROUP BY s.ID
       ORDER BY s.number ASC`,
      [mediaId],
    );
    return rows;
  }

  async readDurationStats(mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COALESCE(SUM(e.duration), 0) AS totalDuration,
              COUNT(e.ID) AS episodeCount
       FROM episode AS e
       JOIN season AS s ON s.ID = e.ID_season
       WHERE s.ID_media = ?`,
      [mediaId],
    );
    return rows[0] as { totalDuration: number; episodeCount: number };
  }
}

export default new SeriesRepository();
