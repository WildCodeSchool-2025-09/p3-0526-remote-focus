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
}

export default new ActorRepository();
