import databaseClient, {
  type Result,
  type Rows,
} from "../../../database/client";
import type {
  Credit,
  ImportedMovie,
  ImportedSeason,
} from "../../utils/tmdbClient";

class MediaImportRepository {
  async findExistingMediaId(
    type: "movie" | "tv",
    tmdbId: number,
  ): Promise<number | null> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT ID AS id FROM media WHERE type = ? AND tmdb_id = ?",
      [type, tmdbId],
    );
    return rows.length > 0 ? (rows[0].id as number) : null;
  }

  async upsertGenre(tmdbId: number, name: string): Promise<number> {
    const [existingByTmdbId] = await databaseClient.query<Rows>(
      "SELECT ID AS id FROM genre WHERE tmdb_id = ?",
      [tmdbId],
    );

    if (existingByTmdbId.length > 0) {
      return existingByTmdbId[0].id as number;
    }

    const [existingByName] = await databaseClient.query<Rows>(
      "SELECT ID AS id FROM genre WHERE name = ?",
      [name],
    );

    if (existingByName.length > 0) {
      return existingByName[0].id as number;
    }

    const [result] = await databaseClient.query<Result>(
      "INSERT INTO genre (tmdb_id, name) VALUES (?, ?)",
      [tmdbId, name],
    );
    return result.insertId;
  }

  async upsertPerson(credit: Credit): Promise<number> {
    const [existing] = await databaseClient.query<Rows>(
      "SELECT ID AS id FROM person WHERE tmdb_id = ?",
      [credit.personTmdbId],
    );

    if (existing.length > 0) {
      return existing[0].id as number;
    }

    const [result] = await databaseClient.query<Result>(
      "INSERT INTO person (tmdb_id, name, photo) VALUES (?, ?, ?)",
      [credit.personTmdbId, credit.name, credit.photo],
    );
    return result.insertId;
  }

  async insertMedia(
    type: "movie" | "tv",
    media: ImportedMovie,
  ): Promise<number> {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO media
         (tmdb_id, name, type, released_at, duration, poster, synopsis,
          overall_rating, status, original_name, original_language, pegi, is_anime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        media.tmdbId,
        media.name,
        type,
        media.releasedAt,
        media.duration,
        media.poster,
        media.synopsis,
        media.overallRating,
        media.status,
        media.originalName,
        media.originalLanguage,
        media.pegi,
        media.isAnime,
      ],
    );
    return result.insertId;
  }

  async linkGenre(mediaId: number, genreId: number): Promise<void> {
    await databaseClient.query(
      "INSERT IGNORE INTO classify_as (ID_media, ID_genre) VALUES (?, ?)",
      [mediaId, genreId],
    );
  }

  async linkPerson(
    mediaId: number,
    personId: number,
    credit: Credit,
  ): Promise<void> {
    await databaseClient.query(
      "INSERT IGNORE INTO media_person (ID_media, ID_person, personnage_name, role) VALUES (?, ?, ?, 'actor')",
      [mediaId, personId, credit.characterName],
    );
  }

  async insertSeason(mediaId: number, season: ImportedSeason): Promise<number> {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO season
         (tmdb_id, name, released_at, poster, synopsis, is_finished, number, ID_media)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        season.tmdbId,
        season.name,
        season.releasedAt,
        season.poster,
        season.synopsis,
        season.isFinished,
        season.number,
        mediaId,
      ],
    );
    return result.insertId;
  }

  async insertEpisode(
    seasonId: number,
    episode: {
      tmdbId: number;
      number: number;
      name: string;
      releasedAt: string | null;
      synopsis: string | null;
      duration: number | null;
    },
  ): Promise<number> {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO episode
         (tmdb_id, name, number, released_at, synopsis, duration, ID_season)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        episode.tmdbId,
        episode.name,
        episode.number,
        episode.releasedAt,
        episode.synopsis,
        episode.duration,
        seasonId,
      ],
    );
    return result.insertId;
  }
}

export default new MediaImportRepository();
