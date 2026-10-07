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

describe("GET /api/me/favorites et /api/me/watchlist", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it.each(["/api/me/favorites", "/api/me/watchlist"])(
    "%s renvoie 401 sans token",
    async (path) => {
      const response = await supertest(app).get(path);

      expect(response.status).toBe(401);
    },
  );

  it("GET /api/me/favorites renvoie 200 avec les médias filtrés", async () => {
    const token = jwt.sign({ id: 1 }, JWT_SECRET);

    jest.spyOn(trackRepository, "browseTracked").mockResolvedValue([
      {
        ID: 7,
        tmdb_id: 99,
        name: "Série",
        type: "tv",
        released_at: "2021-05-01",
        duration: 45,
        poster: "/serie.jpg",
        synopsis: "Synopsis",
        overall_rating: 8.1,
        status: "returning",
        original_name: "Serie",
        original_language: "en",
        pegi: "16",
        is_anime: false,
        genre_name: "Drame",
      },
    ] as never);
    jest.spyOn(trackRepository, "countTrackedByFilters").mockResolvedValue(1);

    const response = await supertest(app)
      .get("/api/me/favorites?type=tv&seen=true")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(trackRepository.browseTracked).toHaveBeenCalledWith(
      1,
      "favorite",
      "tv",
      true,
      10,
      0,
    );
    expect(response.body).toEqual({
      medias: [
        {
          id: 7,
          tmdbId: 99,
          name: "Série",
          type: "tv",
          releasedAt: "2021-05-01",
          duration: 45,
          poster: "/serie.jpg",
          synopsis: "Synopsis",
          overallRating: 8.1,
          status: "returning",
          originalName: "Serie",
          originalLanguage: "en",
          pegi: "16",
          isAnime: false,
          genreName: "Drame",
        },
      ],
      hasMore: false,
    });
  });
});
