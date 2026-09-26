import type { RowDataPacket } from "mysql2";
import databaseClient, { type Rows } from "../../../database/client";
import type { PersonRow } from "../../types/Person/Person.types";

class ActorRepository {
  async read(id: number) {
    const [rows] = await databaseClient.query<PersonRow[]>(
      `SELECT ID, name, photo, biography
       FROM person
       WHERE ID = ?`,
      [id],
    );
    return rows[0] ?? null;
  }

  async readFilmography(personId: number, excludeMediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT m.ID, m.name, m.poster, m.type, m.released_at,
              mp.personnage_name
       FROM media AS m
       JOIN media_person AS mp ON mp.ID_media = m.ID
       WHERE mp.ID_person = ?
         AND mp.role = 'actor'
         AND m.ID <> ?
       ORDER BY m.released_at DESC
       LIMIT 6`,
      [personId, excludeMediaId],
    );
    return rows;
  }

  async readTopRatedByActor(personId: number, excludeMediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT m.ID, m.name, m.poster, m.type, m.released_at, m.overall_rating, m.is_anime,
        mp.personnage_name AS characterNames
      FROM media AS m 
      JOIN media_person AS mp ON mp.ID_media = m.ID 
      WHERE mp.ID_person = ?
        AND mp.role = 'actor' 
        AND m.ID <> ?
      ORDER BY m.overall_rating DESC 
      LIMIT 5`,
      [personId, excludeMediaId],
    );
    return rows;
  }

  async readSeenWithActor(
    personId: number,
    userId: number,
    excludeMediaId: number,
    limit = 10,
    offset = 0,
  ) {
    const [rows] = await databaseClient.query<Rows>(
      `(SELECT m.ID, m.name, m.poster, m.type, m.released_at, m.overall_rating, m.is_anime,
        mp.personnage_name AS characterNames
     FROM media AS m
     JOIN media_person AS mp ON mp.ID_media = m.ID
     JOIN media_user AS mu ON mu.ID_media = m.ID
     WHERE mp.ID_person = ?
       AND mp.role = 'actor'
       AND mu.ID_user = ?
       AND m.ID <> ?)

     UNION ALL

     (SELECT m.ID, m.name, m.poster, m.type, m.released_at, m.overall_rating, m.is_anime,
        GROUP_CONCAT(DISTINCT ep.personnage_name SEPARATOR ', ') AS characterNames
     FROM media AS m
     JOIN season AS s ON s.ID_media = m.ID
     JOIN episode AS e ON e.ID_season = s.ID
     JOIN episode_person AS ep ON ep.ID_episode = e.ID
     JOIN episode_user AS eu ON eu.ID_episode = e.ID
     WHERE ep.ID_person = ?
       AND ep.role = 'actor'
       AND eu.ID_user = ?
       AND m.ID <> ?
     GROUP BY m.ID, m.name, m.poster, m.type, m.released_at, m.overall_rating, m.is_anime) 
     ORDER BY overall_rating DESC LIMIT ? OFFSET ?`,
      [
        personId,
        userId,
        excludeMediaId,
        personId,
        userId,
        excludeMediaId,
        limit,
        offset,
      ],
    );
    return rows;
  }

  async countSeenMediaByActor(
    personId: number,
    userId: number,
    excludeMediaId: number,
  ): Promise<number> {
    const [rows] = await databaseClient.query<
      (RowDataPacket & { total: number })[]
    >(
      `SELECT SUM(total) AS total
     FROM (
       SELECT COUNT(DISTINCT m.ID) AS total
       FROM media AS m
       JOIN media_person AS mp ON mp.ID_media = m.ID
       JOIN media_user AS mu ON mu.ID_media = m.ID
       WHERE mp.ID_person = ?
         AND mp.role = 'actor'
         AND mu.ID_user = ?
         AND m.ID <> ?

       UNION ALL

       SELECT COUNT(DISTINCT m.ID) AS total
       FROM media AS m
       JOIN season AS s ON s.ID_media = m.ID
       JOIN episode AS e ON e.ID_season = s.ID
       JOIN episode_person AS ep ON ep.ID_episode = e.ID
       JOIN episode_user AS eu ON eu.ID_episode = e.ID
       WHERE ep.ID_person = ?
         AND ep.role = 'actor'
         AND eu.ID_user = ?
         AND m.ID <> ?
     ) AS counts`,
      [personId, userId, excludeMediaId, personId, userId, excludeMediaId],
    );

    return rows[0].total;
  }
}

export default new ActorRepository();
