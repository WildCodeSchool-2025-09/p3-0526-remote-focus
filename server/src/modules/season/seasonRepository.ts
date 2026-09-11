import databaseClient, { type Rows } from "../../../database/client";

class SeasonRepository {
  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT s.ID, s.name, s.number, s.poster, s.released_at, s.synopsis, s.is_finished,
              m.ID AS mediaId, m.name AS seriesName, m.poster AS seriesPoster,
              m.overall_rating AS seriesOverallRating
       FROM season AS s
       JOIN media AS m ON m.ID = s.ID_media
       WHERE s.ID = ?`,
      [id],
    );
    return rows[0] ?? null;
  }

  async readEpisodes(seasonId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT ID, name, number, released_at, synopsis, duration
       FROM episode
       WHERE ID_season = ?
       ORDER BY number ASC`,
      [seasonId],
    );
    return rows;
  }

  async readCast(seasonId: number, limit = 10) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT pe.ID, pe.name, pe.photo,
              MIN(ep.personnage_name) AS personnage_name, MIN(ep.role) AS role
       FROM person AS pe
       JOIN episode_person AS ep ON ep.ID_person = pe.ID
       JOIN episode AS e ON e.ID = ep.ID_episode
       WHERE e.ID_season = ? AND ep.role = 'actor'
       GROUP BY pe.ID, pe.name, pe.photo
       ORDER BY pe.ID ASC
       LIMIT ?`,
      [seasonId, limit],
    );
    return rows;
  }

  async countCast(seasonId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(DISTINCT ep.ID_person) AS total
       FROM episode_person AS ep
       JOIN episode AS e ON e.ID = ep.ID_episode
       WHERE e.ID_season = ? AND ep.role = 'actor'`,
      [seasonId],
    );
    return Number((rows as { total: number }[])[0].total);
  }

  async readDurationTotal(seasonId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COALESCE(SUM(duration), 0) AS totalDuration
       FROM episode
       WHERE ID_season = ?`,
      [seasonId],
    );
    return Number((rows as { totalDuration: number }[])[0].totalDuration);
  }
}

export default new SeasonRepository();
