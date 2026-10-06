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
import trackRepository from "../../src/modules/track/trackRepository";

const JWT_SECRET = "test-secret";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /api/me/watchlist", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it("should return 401 when no token is provided", async () => {
    const response = await supertest(app).get("/api/me/watchlist");

    expect(response.status).toBe(401);
  });

  it("should return 200 with the filtered medias when the token is valid", async () => {
    const token = jwt.sign({ id: 1 }, JWT_SECRET);

    jest.spyOn(trackRepository, "browseWatchlist").mockResolvedValue([
      {
        ID: 1,
        tmdb_id: 42,
        name: "Film",
        type: "movie",
        released_at: "2020-01-01",
        duration: 120,
        poster: "/poster.jpg",
        synopsis: "Synopsis",
        overall_rating: 7.5,
        status: "released",
        original_name: "Film",
        original_language: "fr",
        pegi: "12",
        is_anime: false,
        genre_name: "Action",
      },
    ] as never);
    jest.spyOn(trackRepository, "countWatchlistByFilters").mockResolvedValue(1);

    const response = await supertest(app)
      .get("/api/me/watchlist?type=movie&seen=false")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(trackRepository.browseWatchlist).toHaveBeenCalledWith(
      1,
      "movie",
      false,
      10,
      0,
    );
    expect(response.body).toEqual({
      medias: [
        {
          id: 1,
          tmdbId: 42,
          name: "Film",
          type: "movie",
          releasedAt: "2020-01-01",
          duration: 120,
          poster: "/poster.jpg",
          synopsis: "Synopsis",
          overallRating: 7.5,
          status: "released",
          originalName: "Film",
          originalLanguage: "fr",
          pegi: "12",
          isAnime: false,
          genreName: "Action",
        },
      ],
      hasMore: false,
    });
  });
});
