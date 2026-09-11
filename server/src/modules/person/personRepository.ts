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

  async personExists(personId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT ID FROM person WHERE ID = ?",
      [personId],
    );
    return rows.length > 0;
  }

  async readFavorite(userId: number, personId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT 1 FROM favorite WHERE ID_user = ? AND ID_person = ?",
      [userId, personId],
    );
    return rows.length > 0;
  }

  async toggleFavorite(userId: number, personId: number) {
    const isFavorite = await this.readFavorite(userId, personId);

    if (isFavorite) {
      await databaseClient.query(
        "DELETE FROM favorite WHERE ID_user = ? AND ID_person = ?",
        [userId, personId],
      );
      return false;
    }

    await databaseClient.query(
      "INSERT IGNORE INTO favorite (ID_user, ID_person) VALUES (?, ?)",
      [userId, personId],
    );
    return true;
  }

  async readAllFavorites(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT p.ID AS id, p.name, p.photo
       FROM favorite AS f
       JOIN person AS p ON p.ID = f.ID_person
       WHERE f.ID_user = ?`,
      [userId],
    );
    return rows as unknown as {
      id: number;
      name: string;
      photo: string | null;
    }[];
  }

  async readMostViewedActors(
    userId: number,
    limit: number,
  ): Promise<
    { id: number; name: string; photo: string | null; seenCount: number }[]
  > {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT p.ID AS id, p.name, p.photo, COUNT(*) AS seenCount FROM (
         SELECT mp.ID_person AS actorId
         FROM media_person AS mp
         JOIN media_user AS mu ON mu.ID_media = mp.ID_media AND mu.ID_user = ?
         WHERE mp.role = 'actor'
         UNION ALL
         SELECT ep.ID_person AS actorId
         FROM episode_person AS ep
         JOIN episode_user AS eu ON eu.ID_episode = ep.ID_episode AND eu.ID_user = ?
         WHERE ep.role = 'actor'
       ) AS appearances
       JOIN person AS p ON p.ID = appearances.actorId
       GROUP BY p.ID, p.name, p.photo
       ORDER BY seenCount DESC
       LIMIT ?`,
      [userId, userId, limit],
    );
    return rows.map((row) => ({
      id: row.id as number,
      name: row.name as string,
      photo: row.photo as string | null,
      seenCount: Number(row.seenCount),
    }));
  }
}

export default new PersonRepository();
