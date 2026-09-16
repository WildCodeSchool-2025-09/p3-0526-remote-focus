import {
  enrichRanking,
  isMediaNew,
} from "../../src/modules/catalog/catalogHelpers";
import { expect, test, describe, it, afterEach, jest } from "@jest/globals";
import type { Media } from "../../src/types/Media/Media.types";
import app from "../../src/app";
import supertest from "supertest";
import databaseClient from "../../database/client";
import type { Rows } from "../../database/client";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("isMediaNew function", () => {
  test("Media released today should return true", () => {
    const today = new Date();
    expect(isMediaNew(today)).toBe(true);
  });
  test("Media released 92 days ago should return false", () => {
    const ninetyTwoDaysAgo = new Date();
    ninetyTwoDaysAgo.setDate(ninetyTwoDaysAgo.getDate() - 92);
    expect(isMediaNew(ninetyTwoDaysAgo)).toBe(false);
  });
  test("Media released 58 days ago should return true", () => {
    const fiftyEightDaysAgo = new Date();
    fiftyEightDaysAgo.setDate(fiftyEightDaysAgo.getDate() - 58);
    expect(isMediaNew(fiftyEightDaysAgo)).toBe(true);
  });
  test("Media released 90 days ago should return true", () => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    expect(isMediaNew(ninetyDaysAgo)).toBe(true);
  });
  test("null param should return false", () => {
    expect(isMediaNew(null)).toBe(false);
  });
});

describe("enrichRanking function", () => {
  test("First media should have topRank top3 and isNew true", () => {
    const media1 = {
      id: 1,
      tmdbId: 23,
      name: "Media1",
      type: "type1",
      releasedAt: "2026-09-15",
      duration: 120,
      poster: "poster.png",
      synopsis: "synopsis of Media1",
      overallRating: 9.7,
      status: "Finished",
      originalName: "",
      originalLanguage: "",
      pegi: "",
      isAnime: false,
      genreName: "",
    } as Media;
    const media2 = {
      id: 2,
      tmdbId: 45,
      name: "Media2",
      type: "type1",
      releasedAt: "2026-09-14",
      duration: 65,
      poster: "poster.png",
      synopsis: "synopsis of Media2",
      overallRating: 8.9,
      status: "Finished",
      originalName: "",
      originalLanguage: "",
      pegi: "16",
      isAnime: true,
      genreName: "",
    } as Media;
    const medias = [media1, media2];
    const enrichedMedias = enrichRanking(medias);
    expect(enrichedMedias[0].topRank).toBe("top3");
    expect(enrichedMedias[0].isNew).toBe(true);
  });
});

describe("GET api/medias/discover", () => {
  it("should return error : 400 on invalid type", async () => {
    const response = await supertest(app).get(
      "/api/medias/discover?type=fdsfdsd",
    );
    expect(response.status).toBe(400);
  });
  it("should return http 200 status on valid type", async () => {
    const rows = [] as Rows;
    jest
      .spyOn(databaseClient, "query")
      .mockImplementation(async () => [rows, []]);
    const response = await supertest(app).get(
      "/api/medias/discover?type=movie",
    );
    expect(response.status).toBe(200);
  });
});
