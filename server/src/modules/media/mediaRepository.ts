import databaseClient, { type Rows } from "../../../database/client";

class MediaRepository {
  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT ID, name, type, original_name, poster, synopsis, duration,
              released_at, overall_rating, original_language, pegi, status
       FROM media
       WHERE ID = ?`,
      [id],
    );
    return rows[0] ?? null;
  }

  async readGenres(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT g.ID, g.name
       FROM genre AS g
       JOIN classify_as AS c ON c.ID_genre = g.ID
       WHERE c.ID_media = ?`,
      [id],
    );
    return rows;
  }

  async readPlatforms(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT p.ID, p.name, p.logo, p.url
       FROM platform AS p
       JOIN available_on AS a ON a.ID_platform = p.ID
       WHERE a.ID_media = ?`,
      [id],
    );
    return rows;
  }

  async readCast(id: number, limit = 10) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT pe.ID, pe.name, pe.photo, mp.personnage_name, mp.role
       FROM person AS pe
       JOIN media_person AS mp ON mp.ID_person = pe.ID
       WHERE mp.ID_media = ? AND mp.role = 'actor'
       ORDER BY pe.ID ASC
       LIMIT ?`,
      [id, limit],
    );
    return rows;
  }

  async countCast(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total
       FROM media_person
       WHERE ID_media = ? AND role = 'actor'`,
      [id],
    );
    return Number(rows[0].total);
  }

  async readSeasons(mediaId: number) {
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

  async readDurations(mediaId: number) {
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
}

export default new MediaRepository();
