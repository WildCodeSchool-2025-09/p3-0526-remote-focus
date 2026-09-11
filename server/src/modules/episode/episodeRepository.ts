import databaseClient, { type Rows } from "../../../database/client";

class EpisodeRepository {
  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT e.ID, e.name, e.number, e.released_at, e.synopsis, e.duration,
              s.ID AS seasonId, s.name AS seasonName, s.number AS seasonNumber,
              s.poster AS seasonPoster,
              m.ID AS mediaId, m.name AS seriesName, m.poster AS seriesPoster,
              m.overall_rating AS seriesOverallRating, m.pegi AS seriesPegi
       FROM episode AS e
       JOIN season AS s ON s.ID = e.ID_season
       JOIN media AS m ON m.ID = s.ID_media
       WHERE e.ID = ?`,
      [id],
    );
    return rows[0] ?? null;
  }

  async readCast(episodeId: number, limit = 10) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT pe.ID, pe.name, pe.photo, ep.personnage_name, ep.role
       FROM person AS pe
       JOIN episode_person AS ep ON ep.ID_person = pe.ID
       WHERE ep.ID_episode = ? AND ep.role = 'actor'
       ORDER BY pe.ID ASC
       LIMIT ?`,
      [episodeId, limit],
    );
    return rows;
  }

  async countCast(episodeId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total
       FROM episode_person
       WHERE ID_episode = ? AND role = 'actor'`,
      [episodeId],
    );
    return Number((rows as { total: number }[])[0].total);
  }
}

export default new EpisodeRepository();
