import type { RowDataPacket } from "mysql2";
import databaseClient, { type Rows } from "../../../database/client";
import type { Media } from "../../types/Media/Media.types";
import type { PersonRow } from "../../types/Person/Person.types";

export interface FilmographyRow extends Media {
  characterName: string | null;
}

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
    const [rows] = await databaseClient.query<FilmographyRow[]>(
      `SELECT
         m.ID AS id,
         m.tmdb_id AS tmdbId,
         m.name,
         m.type,
         m.released_at AS releasedAt,
         m.duration,
         m.poster,
         m.synopsis,
         m.overall_rating AS overallRating,
         m.status,
         m.original_name AS originalName,
         m.original_language AS originalLanguage,
         m.pegi,
         m.is_anime AS isAnime,
         (SELECT genre.name FROM classify_as
           JOIN genre ON genre.ID = classify_as.ID_genre
           WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName,
         mp.personnage_name AS characterName
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
