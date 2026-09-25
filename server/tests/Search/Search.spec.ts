import { afterEach, describe, expect, it, jest } from "@jest/globals";
import supertest from "supertest";
import databaseClient from "../../database/client";
import type { Rows } from "../../database/client";
import app from "../../src/app";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET api/medias/search", () => {
  it("should return error : 400 on invalid type", async () => {
    const response = await supertest(app).get(
      "/api/medias/search?q=test&type=invalid",
    );
    expect(response.status).toBe(400);
  });

  it("should return empty categories on a query shorter than 2 characters", async () => {
    const response = await supertest(app).get("/api/medias/search?q=a");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      films: [],
      series: [],
      animes: [],
      actors: [],
      hasMore: false,
    });
  });

  it("should return categorized results on a valid query", async () => {
    const mediaRows = [
      {
        id: 1,
        tmdbId: 100,
        name: "Test Movie",
        type: "movie",
        releasedAt: "2024-01-01",
        duration: 120,
        poster: "poster.jpg",
        synopsis: "synopsis",
        overallRating: 7.5,
        status: "Released",
        originalName: "Test Movie",
        originalLanguage: "en",
        pegi: "12",
        isAnime: false,
        genreName: "Action",
      },
    ] as Rows;

    const personRows = [
      { id: 1, name: "Test Actor", photo: "actor.jpg" },
    ] as Rows;

    const countRows = [{ total: 1 }] as Rows;

    jest
      .spyOn(databaseClient, "query")
      .mockImplementationOnce(async () => [mediaRows, []])
      .mockImplementationOnce(async () => [personRows, []])
      .mockImplementationOnce(async () => [countRows, []]);

    const response = await supertest(app).get("/api/medias/search?q=test");

    expect(response.status).toBe(200);
    expect(response.body.films).toHaveLength(1);
    expect(response.body.films[0].name).toBe("Test Movie");
    expect(response.body.series).toHaveLength(0);
    expect(response.body.animes).toHaveLength(0);
    expect(response.body.actors).toHaveLength(1);
    expect(response.body.actors[0].name).toBe("Test Actor");
    expect(response.body.hasMore).toBe(false);
  });

  it("should categorize an anime as anime regardless of its movie/tv type", async () => {
    const mediaRows = [
      {
        id: 2,
        tmdbId: 200,
        name: "Test Anime",
        type: "tv",
        releasedAt: "2024-01-01",
        duration: null,
        poster: "poster.jpg",
        synopsis: "synopsis",
        overallRating: 8.2,
        status: "Ended",
        originalName: "Test Anime",
        originalLanguage: "ja",
        pegi: "12",
        isAnime: true,
        genreName: "Animation",
      },
    ] as Rows;

    jest
      .spyOn(databaseClient, "query")
      .mockImplementationOnce(async () => [mediaRows, []])
      .mockImplementationOnce(async () => [[] as Rows, []])
      .mockImplementationOnce(async () => [[{ total: 1 }] as Rows, []]);

    const response = await supertest(app).get("/api/medias/search?q=test");

    expect(response.status).toBe(200);
    expect(response.body.animes).toHaveLength(1);
    expect(response.body.animes[0].name).toBe("Test Anime");
    expect(response.body.films).toHaveLength(0);
    expect(response.body.series).toHaveLength(0);
  });
});

const mockMediaAndCountQueries = (mediaRows: Rows, total: number) =>
  jest
    .spyOn(databaseClient, "query")
    .mockImplementationOnce(async () => [mediaRows, []])
    .mockImplementationOnce(async () => [[{ total }] as Rows, []]);

describe("GET api/medias/search with a genre filter", () => {
  it.each(["abc", "0", "-2", "1.5", "1,,2"])(
    "should return error : 400 on invalid genre %s",
    async (genre) => {
      const response = await supertest(app).get(
        `/api/medias/search?q=test&genre=${genre}`,
      );
      expect(response.status).toBe(400);
    },
  );

  it("should apply the genres to the media query and to the count query", async () => {
    const querySpy = mockMediaAndCountQueries([] as Rows, 0);

    const response = await supertest(app).get(
      "/api/medias/search?q=test&genre=1,4",
    );

    expect(response.status).toBe(200);
    expect(String(querySpy.mock.calls[0][0])).toContain("classify_as");
    expect(querySpy.mock.calls[0][1]).toEqual(["%test%", 1, 4, "test%", 20, 0]);
    expect(querySpy.mock.calls[1][1]).toEqual(["%test%", 1, 4]);
  });

  it("should keep the SQL parameters in order when type and genre are combined", async () => {
    const querySpy = mockMediaAndCountQueries([] as Rows, 0);

    const response = await supertest(app).get(
      "/api/medias/search?q=test&type=movie&genre=2",
    );

    expect(response.status).toBe(200);
    expect(querySpy.mock.calls[0][1]).toEqual([
      "%test%",
      "movie",
      2,
      "test%",
      20,
      0,
    ]);
    expect(querySpy.mock.calls[1][1]).toEqual(["%test%", "movie", 2]);
  });

  it("should not search actors when a genre is active", async () => {
    const querySpy = mockMediaAndCountQueries([] as Rows, 0);

    const response = await supertest(app).get(
      "/api/medias/search?q=test&genre=1",
    );

    expect(response.status).toBe(200);
    expect(response.body.actors).toEqual([]);
    expect(querySpy).toHaveBeenCalledTimes(2);
  });

  it("should ignore an empty genre parameter and still search actors", async () => {
    const querySpy = jest
      .spyOn(databaseClient, "query")
      .mockImplementationOnce(async () => [[] as Rows, []])
      .mockImplementationOnce(async () => [
        [{ id: 1, name: "Test Actor", photo: null }] as Rows,
        [],
      ])
      .mockImplementationOnce(async () => [[{ total: 0 }] as Rows, []]);

    const response = await supertest(app).get(
      "/api/medias/search?q=test&genre=",
    );

    expect(response.status).toBe(200);
    expect(response.body.actors).toHaveLength(1);
    expect(querySpy).toHaveBeenCalledTimes(3);
    expect(String(querySpy.mock.calls[0][0])).not.toContain("classify_as ca");
  });
});
