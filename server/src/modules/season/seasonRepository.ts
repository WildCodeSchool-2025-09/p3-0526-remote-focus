import databaseClient, { type Rows } from "../../../database/client";

class SeasonRepository {
  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT s.ID, s.name, s.number, s.poster, s.released_at,
              s.synopsis, s.is_finished, s.ID_media,
              m.name AS media_name, m.poster AS media_poster,
              m.original_language, m.type, m.is_anime
       FROM season AS s
       JOIN media AS m ON m.ID = s.ID_media
       WHERE s.ID = ?`,
      [id],
    );
    return (rows[0] as Rows[number] | undefined) ?? null;
  }

  async readByMedia(mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT s.ID, s.name, s.number, s.poster, s.released_at,
              s.synopsis, s.is_finished,
              COUNT(e.ID) AS episode_count
       FROM season AS s
       LEFT JOIN episode AS e ON e.ID_season = s.ID
       WHERE s.ID_media = ?
       GROUP BY s.ID
       ORDER BY s.number ASC`,
      [mediaId],
    );
    return rows;
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

  async readCast(id: number, limit = 10) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT DISTINCT pe.ID, pe.name, pe.photo,
              ep.personnage_name, ep.role
       FROM person AS pe
       JOIN episode_person AS ep ON ep.ID_person = pe.ID
       JOIN episode AS e ON e.ID = ep.ID_episode
       WHERE e.ID_season = ? AND ep.role = 'actor'
       ORDER BY pe.ID ASC
       LIMIT ?`,
      [id, limit],
    );
    return rows;
  }

  async countCast(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(DISTINCT ep.ID_person) AS total
       FROM episode_person AS ep
       JOIN episode AS e ON e.ID = ep.ID_episode
       WHERE e.ID_season = ? AND ep.role = 'actor'`,
      [id],
    );
    return Number(rows[0].total);
  }

  async readDuration(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT SUM(duration) AS total_duration,
              COUNT(ID) AS episode_count
       FROM episode
       WHERE ID_season = ?`,
      [id],
    );
    return rows[0];
  }

  async readDurationByMedia(mediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT SUM(e.duration) AS total_duration,
              AVG(e.duration) AS average_duration,
              COUNT(e.ID) AS episode_count
       FROM episode AS e
       JOIN season AS s ON s.ID = e.ID_season
       WHERE s.ID_media = ?`,
      [mediaId],
    );
    return rows[0];
  }
}

export default new SeasonRepository();
