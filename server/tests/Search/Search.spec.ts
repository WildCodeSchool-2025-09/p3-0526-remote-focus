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
