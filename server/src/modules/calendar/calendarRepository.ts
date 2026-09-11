import databaseClient, { type Rows } from "../../../database/client";
import { PEGI16_VALUES, pegiFilterClause } from "../../utils/applyPegiFilter";

export type CalendarItem = {
  id: number;
  title: string;
  episodeName: string | null;
  poster: string | null;
  year: number | null;
  releasedAt: string;
  genreName: string | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
};

class CalendarRepository {
  async readMovies(
    dateFrom: Date,
    dateTo: Date,
    hidePegi16: boolean,
    isAnime: boolean,
  ): Promise<CalendarItem[]> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT m.ID AS id, m.name AS title, NULL AS episodeName, m.poster,
              YEAR(m.released_at) AS year,
              DATE_FORMAT(m.released_at, '%Y-%m-%d') AS releasedAt,
              (SELECT genre.name FROM classify_as JOIN genre ON genre.ID = classify_as.ID_genre
               WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName,
              NULL AS seasonNumber, NULL AS episodeNumber
       FROM media AS m
       WHERE m.type = 'movie' AND m.is_anime = ?
         AND m.released_at BETWEEN ? AND ?
         AND ${pegiFilterClause("m")}
       ORDER BY m.released_at ASC`,
      [isAnime, dateFrom, dateTo, hidePegi16, PEGI16_VALUES],
    );
    return rows as unknown as CalendarItem[];
  }

  async readEpisodes(
    dateFrom: Date,
    dateTo: Date,
    hidePegi16: boolean,
    isAnime: boolean,
  ): Promise<CalendarItem[]> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT m.ID AS id, m.name AS title, e.name AS episodeName, m.poster,
              YEAR(m.released_at) AS year,
              DATE_FORMAT(e.released_at, '%Y-%m-%d') AS releasedAt,
              (SELECT genre.name FROM classify_as JOIN genre ON genre.ID = classify_as.ID_genre
               WHERE classify_as.ID_media = m.ID LIMIT 1) AS genreName,
              s.number AS seasonNumber, e.number AS episodeNumber
       FROM episode AS e
       JOIN season AS s ON s.ID = e.ID_season
       JOIN media AS m ON m.ID = s.ID_media
       WHERE m.type = 'tv' AND m.is_anime = ?
         AND e.released_at BETWEEN ? AND ?
         AND ${pegiFilterClause("m")}
       ORDER BY e.released_at ASC`,
      [isAnime, dateFrom, dateTo, hidePegi16, PEGI16_VALUES],
    );
    return rows as unknown as CalendarItem[];
  }
}

export default new CalendarRepository();
