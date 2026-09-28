import databaseClient, { type Rows } from "../../../database/client";

class EpisodeRepository {
  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT e.ID, e.name, e.number, e.released_at, e.synopsis, e.duration,
              e.ID_season,
              s.number AS season_number, s.poster AS season_poster,
              s.ID_media,
              m.name AS media_name, m.poster AS media_poster,
              m.original_language, m.overall_rating, m.type, m.is_anime
       FROM episode AS e
       JOIN season AS s ON s.ID = e.ID_season
       JOIN media AS m ON m.ID = s.ID_media
       WHERE e.ID = ?`,
      [id],
    );
    return (rows[0] as Rows[number] | undefined) ?? null;
  }

  async readCast(id: number, limit = 10) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT pe.ID, pe.name, pe.photo, ep.personnage_name, ep.role
       FROM person AS pe
       JOIN episode_person AS ep ON ep.ID_person = pe.ID
       WHERE ep.ID_episode = ? AND ep.role = 'actor'
       ORDER BY pe.ID ASC
       LIMIT ?`,
      [id, limit],
    );
    return rows;
  }

  async countCast(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total
       FROM episode_person
       WHERE ID_episode = ? AND role = 'actor'`,
      [id],
    );
    return Number(rows[0].total);
  }
}

export default new EpisodeRepository();
