import databaseClient, { type Rows } from "../../../database/client";

const MONTHS_IN_YEAR = 12;

class StatisticRepository {
  // Films vus (media_user) UNION séries entièrement vues (même règle que
  // isSeriesFullyWatched : au moins un épisode, et total = vus).
  async readWatchedMediaIds(userId: number): Promise<number[]> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT m.ID AS id
       FROM media AS m
       WHERE m.type = 'movie'
         AND EXISTS (SELECT 1 FROM media_user AS mu WHERE mu.ID_media = m.ID AND mu.ID_user = ?)
       UNION
       SELECT m.ID AS id
       FROM media AS m
       WHERE m.type = 'tv'
         AND (SELECT COUNT(*) FROM episode AS e JOIN season AS s ON s.ID = e.ID_season WHERE s.ID_media = m.ID) > 0
         AND (SELECT COUNT(*) FROM episode AS e JOIN season AS s ON s.ID = e.ID_season WHERE s.ID_media = m.ID)
           = (SELECT COUNT(*) FROM episode_user AS eu
              JOIN episode AS e ON e.ID = eu.ID_episode
              JOIN season AS s ON s.ID = e.ID_season
              WHERE s.ID_media = m.ID AND eu.ID_user = ?)`,
      [userId, userId],
    );
    return rows.map((row) => row.id as number);
  }

  async sumWatchTimeMinutes(userId: number): Promise<number> {
    const [movieRows] = await databaseClient.query<Rows>(
      `SELECT COALESCE(SUM(m.duration), 0) AS minutes
       FROM media_user AS mu
       JOIN media AS m ON m.ID = mu.ID_media
       WHERE mu.ID_user = ?`,
      [userId],
    );

    const [episodeRows] = await databaseClient.query<Rows>(
      `SELECT COALESCE(SUM(e.duration), 0) AS minutes
       FROM episode_user AS eu
       JOIN episode AS e ON e.ID = eu.ID_episode
       WHERE eu.ID_user = ?`,
      [userId],
    );

    return (
      Number((movieRows as { minutes: number }[])[0].minutes) +
      Number((episodeRows as { minutes: number }[])[0].minutes)
    );
  }

  async readMonthlyWatchTimeMinutes(
    userId: number,
    year: number,
  ): Promise<number[]> {
    const months = new Array(MONTHS_IN_YEAR).fill(0) as number[];

    const [movieRows] = await databaseClient.query<Rows>(
      `SELECT MONTH(mu.viewed_at) AS month, COALESCE(SUM(m.duration), 0) AS minutes
       FROM media_user AS mu
       JOIN media AS m ON m.ID = mu.ID_media
       WHERE mu.ID_user = ? AND YEAR(mu.viewed_at) = ?
       GROUP BY MONTH(mu.viewed_at)`,
      [userId, year],
    );

    const [episodeRows] = await databaseClient.query<Rows>(
      `SELECT MONTH(eu.viewed_at) AS month, COALESCE(SUM(e.duration), 0) AS minutes
       FROM episode_user AS eu
       JOIN episode AS e ON e.ID = eu.ID_episode
       WHERE eu.ID_user = ? AND YEAR(eu.viewed_at) = ?
       GROUP BY MONTH(eu.viewed_at)`,
      [userId, year],
    );

    for (const row of [...movieRows, ...episodeRows] as {
      month: number;
      minutes: number;
    }[]) {
      months[row.month - 1] += Number(row.minutes);
    }

    return months;
  }

  async readGenreBreakdown(
    mediaIds: number[],
  ): Promise<{ genreId: number; genreName: string; count: number }[]> {
    if (mediaIds.length === 0) {
      return [];
    }

    const [rows] = await databaseClient.query<Rows>(
      `SELECT genre.ID AS genreId, genre.name AS genreName, COUNT(*) AS count
       FROM (
         SELECT m.ID AS mediaId,
                (SELECT classify_as.ID_genre FROM classify_as
                 WHERE classify_as.ID_media = m.ID LIMIT 1) AS primaryGenreId
         FROM media AS m
         WHERE m.ID IN (?)
       ) AS primaryGenres
       JOIN genre ON genre.ID = primaryGenres.primaryGenreId
       GROUP BY genre.ID, genre.name
       ORDER BY count DESC`,
      [mediaIds],
    );
    return rows as unknown as {
      genreId: number;
      genreName: string;
      count: number;
    }[];
  }
}

export default new StatisticRepository();
