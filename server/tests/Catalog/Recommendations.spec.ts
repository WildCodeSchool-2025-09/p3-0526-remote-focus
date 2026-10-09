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
import catalogRepository from "../../src/modules/catalog/catalogRepository";
import watchingRepository from "../../src/modules/watching/watchingRepository";
import type { Media } from "../../src/types/Media/Media.types";

const JWT_SECRET = "test-secret";

let authorization: string;

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;

  authorization = `Bearer ${jwt.sign({ id: 7 }, JWT_SECRET)}`;
});

afterEach(() => {
  jest.restoreAllMocks();
});

const recommendedMedia = {
  id: 42,
  name: "Film recommandé",
  type: "movie",
  releasedAt: new Date("2020-01-01"),
  overallRating: 8,
} as unknown as Media;

describe("GET /api/me/recommendations", () => {
  it("renvoie 401 sans token", async () => {
    const response = await supertest(app).get("/api/me/recommendations");

    expect(response.status).toBe(401);
  });

  it("renvoie 200 et utilise l'utilisateur du token, les médias vus et la limite 10", async () => {
    jest
      .spyOn(watchingRepository, "readMediaWatched")
      .mockResolvedValue([1, 2, 3]);
    const readRecommended = jest
      .spyOn(catalogRepository, "readRecommended")
      .mockResolvedValue([recommendedMedia]);
    jest.spyOn(catalogRepository, "readTopRated").mockResolvedValue([]);

    const response = await supertest(app)
      .get("/api/me/recommendations")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body.forYou).toHaveLength(1);
    expect(response.body.forYou[0].id).toBe(42);
    expect(readRecommended).toHaveBeenCalledWith(7, [1, 2, 3], 10);
  });

  it("transmet une liste vide quand l'utilisateur n'a rien vu", async () => {
    jest.spyOn(watchingRepository, "readMediaWatched").mockResolvedValue([]);
    const readRecommended = jest
      .spyOn(catalogRepository, "readRecommended")
      .mockResolvedValue([]);
    jest.spyOn(catalogRepository, "readTopRated").mockResolvedValue([]);

    await supertest(app)
      .get("/api/me/recommendations")
      .set("Authorization", authorization);

    expect(readRecommended).toHaveBeenCalledWith(7, [], 10);
  });

  it("renvoie 200 et un tableau vide quand rien ne correspond", async () => {
    jest.spyOn(watchingRepository, "readMediaWatched").mockResolvedValue([]);
    jest.spyOn(catalogRepository, "readRecommended").mockResolvedValue([]);
    jest.spyOn(catalogRepository, "readTopRated").mockResolvedValue([]);

    const response = await supertest(app)
      .get("/api/me/recommendations")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ forYou: [] });
  });
});
