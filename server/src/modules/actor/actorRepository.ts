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

  async readFilmography(
    personId: number,
    excludeMediaId: number,
    limit: number,
    offset: number,
  ) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
         m.ID, m.tmdb_id, m.name, m.type, m.released_at, m.duration,
         m.poster, m.synopsis, m.overall_rating, m.status,
         m.original_name, m.original_language, m.pegi, m.is_anime,
         (SELECT genre.name FROM classify_as
           JOIN genre ON genre.ID = classify_as.ID_genre
           WHERE classify_as.ID_media = m.ID LIMIT 1) AS genre_name,
         mp.personnage_name
       FROM media AS m
       JOIN media_person AS mp ON mp.ID_media = m.ID
       WHERE mp.ID_person = ?
         AND mp.role = 'actor'
         AND m.ID <> ?
       ORDER BY m.released_at IS NULL, m.released_at DESC, m.ID DESC
       LIMIT ? OFFSET ?`,
      [personId, excludeMediaId, limit, offset],
    );
    return rows;
  }

  async countFilmography(personId: number, excludeMediaId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS total
       FROM media_person
       WHERE ID_person = ?
         AND role = 'actor'
         AND ID_media <> ?`,
      [personId, excludeMediaId],
    );
    return Number(rows[0].total);
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
      `SELECT  ID,  name,  poster,  type,  released_at,  overall_rating,  is_anime,
        GROUP_CONCAT(DISTINCT characterNames SEPARATOR ', ') AS characterNames
      FROM (
        (
          SELECT m.ID, m.name, m.poster, m.type, m.released_at, m.overall_rating, m.is_anime, mp.personnage_name AS characterNames
          FROM media AS m
          JOIN media_person AS mp ON mp.ID_media = m.ID
          JOIN media_user AS mu ON mu.ID_media = m.ID
          WHERE mp.ID_person = ?
            AND mp.role = 'actor'
            AND mu.ID_user = ?
            AND m.ID <> ?
        )

        UNION ALL

        (
          SELECT m.ID, m.name, m.poster, m.type, m.released_at, m.overall_rating, m.is_anime,
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
          GROUP BY m.ID, m.name, m.poster, m.type, m.released_at, m.overall_rating, m.is_anime
        )
      ) AS seen_medias
      GROUP BY  ID,  name,  poster,  type,  released_at,  overall_rating,  is_anime
      ORDER BY overall_rating DESC
      LIMIT ? OFFSET ?`,
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
      `SELECT COUNT(DISTINCT ID) AS total
      FROM (
        (
          SELECT m.ID
          FROM media AS m
          JOIN media_person AS mp ON mp.ID_media = m.ID
          JOIN media_user AS mu ON mu.ID_media = m.ID
          WHERE mp.ID_person = ?
            AND mp.role = 'actor'
            AND mu.ID_user = ?
            AND m.ID <> ?
        )

        UNION ALL

        (
          SELECT m.ID
          FROM media AS m
          JOIN season AS s ON s.ID_media = m.ID
          JOIN episode AS e ON e.ID_season = s.ID
          JOIN episode_person AS ep ON ep.ID_episode = e.ID
          JOIN episode_user AS eu ON eu.ID_episode = e.ID
          WHERE ep.ID_person = ?
            AND ep.role = 'actor'
            AND eu.ID_user = ?
            AND m.ID <> ?
        )
      ) AS seen_medias`,
      [personId, userId, excludeMediaId, personId, userId, excludeMediaId],
    );

    return rows[0].total;
  }

  async readMostWatched(userId: number, limit = 12) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT pe.ID, pe.name, pe.photo, NULL AS personnage_name, 'actor' AS role
       FROM person AS pe
       JOIN (
         (SELECT mp.ID_person, mp.ID_media
          FROM media_person AS mp
          JOIN media_user AS mu ON mu.ID_media = mp.ID_media
          WHERE mu.ID_user = ? AND mp.role = 'actor')
         UNION
         (SELECT mp.ID_person, s.ID_media
          FROM media_person AS mp
          JOIN season AS s ON s.ID_media = mp.ID_media
          JOIN episode AS e ON e.ID_season = s.ID
          JOIN episode_user AS eu ON eu.ID_episode = e.ID
          WHERE eu.ID_user = ? AND mp.role = 'actor')
         UNION
         (SELECT ep.ID_person, s.ID_media
          FROM episode_person AS ep
          JOIN episode AS e ON e.ID = ep.ID_episode
          JOIN season AS s ON s.ID = e.ID_season
          JOIN episode_user AS eu ON eu.ID_episode = e.ID
          WHERE eu.ID_user = ? AND ep.role = 'actor')
       ) AS seen ON seen.ID_person = pe.ID
       GROUP BY pe.ID, pe.name, pe.photo
       ORDER BY COUNT(*) DESC, pe.name ASC, pe.ID ASC
       LIMIT ?`,
      [userId, userId, userId, limit],
    );
    return rows;
  }
}

export default new ActorRepository();
