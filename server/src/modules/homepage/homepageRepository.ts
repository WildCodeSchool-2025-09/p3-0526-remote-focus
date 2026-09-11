import databaseClient from "../../../database/client";

import type { Media } from "../../types/Media/Media.types";

class HomepageRepository {
  async readByCategory(
    category: "movie" | "tv" | "anime",
    limit = 20,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      `SELECT ID AS id, tmdb_id AS tmdbId, name, type, released_at AS releasedAt,
              duration, poster, synopsis, overall_rating AS overallRating,
              status, original_name AS originalName, original_language AS originalLanguage,
              pegi, is_anime AS isAnime
       FROM media
       WHERE (? = 'anime' AND is_anime = TRUE)
          OR (? = 'movie' AND type = 'movie' AND is_anime = FALSE)
          OR (? = 'tv'    AND type = 'tv'    AND is_anime = FALSE)
       ORDER BY overall_rating DESC
       LIMIT ?`,
      [category, category, category, limit],
    );

    return rows;
  }
}

export default new HomepageRepository();
