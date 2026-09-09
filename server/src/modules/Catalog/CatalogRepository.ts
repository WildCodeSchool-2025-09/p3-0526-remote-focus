import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";

import type { Media } from "../../types/Media/Media.types";

class CatalogRepository {
  async readTopRated(
    type: "movie" | "tv" | "anime" | null,
    limit = 10,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      "SELECT * FROM media WHERE type = ? OR ? IS NULL ORDER BY overall_rating DESC LIMIT ?",
      [type, type, limit],
    );
    return rows;
  }

  async readLatest30Days(
    type: "movie" | "tv" | "anime" | null,
    limit = 10,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      "SELECT * FROM media WHERE (released_at BETWEEN NOW() - INTERVAL 30 DAY AND NOW()) AND (type = ? OR ? IS NULL) ORDER BY released_at DESC LIMIT ?",
      [type, type, limit],
    );
    return rows;
  }

  async readTopByGenre(
    genreId: number,
    type: "movie" | "tv" | "anime" | null,
    limit = 10,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      "SELECT media.* FROM media JOIN classify_as ON media.ID=classify_as.ID_media WHERE classify_as.ID_genre = ? AND (media.type = ? OR ? IS NULL) ORDER BY media.overall_rating DESC LIMIT ?",
      [genreId, type, type, limit],
    );
    return rows;
  }
}

export default new CatalogRepository();
