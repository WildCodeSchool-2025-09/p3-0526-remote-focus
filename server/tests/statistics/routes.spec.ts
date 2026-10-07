import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import jwt from "jsonwebtoken";
import supertest from "supertest";

import app from "../../src/app";
import statisticsRepository from "../../src/modules/statistics/statisticsRepository";

const JWT_SECRET = "test-secret";

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /api/me/statistics", () => {
  it("should return 401 when no token is provided", async () => {
    const response = await supertest(app).get("/api/me/statistics");

    expect(response.status).toBe(401);
  });

  it("should return 200 with the computed statistics", async () => {
    const token = jwt.sign({ id: 1 }, JWT_SECRET);

    jest.spyOn(statisticsRepository, "countWatchedTitles").mockResolvedValue(2);
    jest
      .spyOn(statisticsRepository, "sumWatchedDuration")
      .mockResolvedValue(240);
    jest
      .spyOn(statisticsRepository, "readMonthlyWatchedDuration")
      .mockResolvedValue([{ month: 2, totalDuration: 240 }]);
    jest
      .spyOn(statisticsRepository, "readGenreBreakdown")
      .mockResolvedValue([{ genreName: "Thriller", total: 2 }]);

    const response = await supertest(app)
      .get("/api/me/statistics")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      titlesWatched: 2,
      totalDurationMinutes: 240,
      monthlyDuration: [0, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      genreDistribution: [{ genre: "Thriller", percentage: 100 }],
      topGenres: [{ genre: "Thriller", count: 2 }],
    });
  });
});
