import type { Request, Response } from "express";
import statisticsActions from "../../src/modules/statistics/statisticsActions";
import statisticsRepository from "../../src/modules/statistics/statisticsRepository";

jest.mock("../../src/modules/statistics/statisticsRepository");

const mockedStatisticsRepository = statisticsRepository as jest.Mocked<
  typeof statisticsRepository
>;

const createResponse = () =>
  ({
    sendStatus: jest.fn(),
    json: jest.fn(),
  }) as unknown as Response;

describe("statisticsActions.readStatistics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {} as unknown as Request;
    const res = createResponse();

    await statisticsActions.readStatistics(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(
      mockedStatisticsRepository.countWatchedTitles,
    ).not.toHaveBeenCalled();
  });

  test("renvoie les statistiques avec les pourcentages calculés", async () => {
    const req = { user: { id: 1 } } as unknown as Request;
    const res = createResponse();

    mockedStatisticsRepository.countWatchedTitles.mockResolvedValue(10);
    mockedStatisticsRepository.sumWatchedDuration.mockResolvedValue(1200);
    mockedStatisticsRepository.readMonthlyWatchedDuration.mockResolvedValue([
      { month: 1, totalDuration: 300 },
      { month: 3, totalDuration: 150 },
    ]);
    mockedStatisticsRepository.readGenreBreakdown.mockResolvedValue([
      { genreName: "Drame", total: 6 },
      { genreName: null, total: 4 },
    ]);

    await statisticsActions.readStatistics(req, res, jest.fn());

    expect(
      mockedStatisticsRepository.readMonthlyWatchedDuration,
    ).toHaveBeenCalledWith(1, new Date().getFullYear());
    expect(res.json).toHaveBeenCalledWith({
      titlesWatched: 10,
      totalDurationMinutes: 1200,
      monthlyDuration: [300, 0, 150, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      genreDistribution: [
        { genre: "Drame", percentage: 60 },
        { genre: "Autres", percentage: 40 },
      ],
      topGenres: [
        { genre: "Drame", count: 6 },
        { genre: "Autres", count: 4 },
      ],
    });
  });

  test("renvoie des valeurs à 0 quand l'utilisateur n'a rien vu", async () => {
    const req = { user: { id: 2 } } as unknown as Request;
    const res = createResponse();

    mockedStatisticsRepository.countWatchedTitles.mockResolvedValue(0);
    mockedStatisticsRepository.sumWatchedDuration.mockResolvedValue(0);
    mockedStatisticsRepository.readMonthlyWatchedDuration.mockResolvedValue([]);
    mockedStatisticsRepository.readGenreBreakdown.mockResolvedValue([]);

    await statisticsActions.readStatistics(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({
      titlesWatched: 0,
      totalDurationMinutes: 0,
      monthlyDuration: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      genreDistribution: [],
      topGenres: [],
    });
  });
});
