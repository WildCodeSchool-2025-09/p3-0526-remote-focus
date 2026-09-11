import databaseClient, { type Rows } from "../../../database/client";

class PersonRepository {
  async readTopRatedByActor(
    personId: number,
    excludeMediaId: number,
    limit: number,
  ) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT m.ID, m.name, m.poster, m.type, m.released_at, m.overall_rating
       FROM media AS m
       JOIN media_person AS mp ON mp.ID_media = m.ID
       WHERE mp.ID_person = ? AND mp.role = 'actor' AND m.ID <> ?
       ORDER BY m.overall_rating DESC
       LIMIT ?`,
      [personId, excludeMediaId, limit],
    );
    return rows;
  }

  async readSeenMediaByActor(
    userId: number,
    personId: number,
    excludeMediaId: number,
    offset: number,
    limit: number,
  ) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT * FROM (
         SELECT m.ID, m.name, m.poster, m.type, m.released_at, m.overall_rating
         FROM media AS m
         JOIN media_person AS mp ON mp.ID_media = m.ID
         JOIN media_user AS mu ON mu.ID_media = m.ID AND mu.ID_user = ?
         WHERE mp.ID_person = ? AND mp.role = 'actor' AND m.type = 'movie' AND m.ID <> ?

         UNION

         SELECT DISTINCT m.ID, m.name, m.poster, m.type, m.released_at, m.overall_rating
         FROM media AS m
         JOIN season AS s ON s.ID_media = m.ID
         JOIN episode AS e ON e.ID_season = s.ID
         JOIN episode_person AS ep ON ep.ID_episode = e.ID
         JOIN episode_user AS eu ON eu.ID_episode = e.ID AND eu.ID_user = ?
         WHERE ep.ID_person = ? AND ep.role = 'actor' AND m.ID <> ?
       ) AS seen
       ORDER BY overall_rating DESC
       LIMIT ? OFFSET ?`,
      [
        userId,
        personId,
        excludeMediaId,
        userId,
        personId,
        excludeMediaId,
        limit,
        offset,
      ],
    );
    return rows;
  }

  async countSeenMediaByActor(
    userId: number,
    personId: number,
    excludeMediaId: number,
  ) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total FROM (
         SELECT m.ID
         FROM media AS m
         JOIN media_person AS mp ON mp.ID_media = m.ID
         JOIN media_user AS mu ON mu.ID_media = m.ID AND mu.ID_user = ?
         WHERE mp.ID_person = ? AND mp.role = 'actor' AND m.type = 'movie' AND m.ID <> ?

         UNION

         SELECT DISTINCT m.ID
         FROM media AS m
         JOIN season AS s ON s.ID_media = m.ID
         JOIN episode AS e ON e.ID_season = s.ID
         JOIN episode_person AS ep ON ep.ID_episode = e.ID
         JOIN episode_user AS eu ON eu.ID_episode = e.ID AND eu.ID_user = ?
         WHERE ep.ID_person = ? AND ep.role = 'actor' AND m.ID <> ?
       ) AS seen`,
      [userId, personId, excludeMediaId, userId, personId, excludeMediaId],
    );
    return Number((rows as { total: number }[])[0].total);
  }

  async countFavorites(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT COUNT(*) AS total FROM favorite WHERE ID_user = ?",
      [userId],
    );
    return Number((rows as { total: number }[])[0].total);
  }
}

export default new PersonRepository();
