import databaseClient from "../../../database/client";

import type { Media } from "../../types/Media/Media.types";

class HomepageRepository {
  async readByCategory(
    category: "movie" | "tv" | "anime",
    limit = 20,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      `SELECT m.ID AS id, m.tmdb_id AS tmdbId, m.name, m.type, m.released_at AS releasedAt,
              m.duration, m.poster, m.synopsis, m.overall_rating AS overallRating, m.status,
              m.original_name AS originalName, m.original_language AS originalLanguage,
              m.pegi, m.is_anime AS isAnime,
              (SELECT genre.name FROM classify_as
                 JOIN genre ON genre.ID = classify_as.ID_genre
                WHERE classify_as.ID_media = m.ID
                LIMIT 1) AS genreName
       FROM media AS m
       WHERE (? = 'anime' AND m.is_anime = TRUE)
          OR (? = 'movie' AND m.type = 'movie' AND m.is_anime = FALSE)
          OR (? = 'tv'    AND m.type = 'tv'    AND m.is_anime = FALSE)
       ORDER BY m.overall_rating DESC
       LIMIT ?`,
      [category, category, category, limit],
    );

    return rows;
  }
}

export default new HomepageRepository();
