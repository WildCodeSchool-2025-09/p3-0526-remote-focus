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
import actorRepository from "../../src/modules/actor/actorRepository";

const JWT_SECRET = "test-secret";

let authorization: string;

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;

  authorization = `Bearer ${jwt.sign({ id: 7 }, JWT_SECRET)}`;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /api/me/actors/most-watched", () => {
  it("renvoie 401 sans token", async () => {
    const response = await supertest(app).get("/api/me/actors/most-watched");

    expect(response.status).toBe(401);
  });

  it("renvoie 200 avec viewedCount, sans pagination ni count quand page est absent", async () => {
    jest.spyOn(actorRepository, "readMostWatched").mockResolvedValue([
      {
        ID: 5,
        name: "Actrice Test",
        photo: "/photo.jpg",
        personnage_name: null,
        role: "actor",
        viewed_count: 3,
      },
    ] as never);
    const countMostWatched = jest.spyOn(actorRepository, "countMostWatched");

    const response = await supertest(app)
      .get("/api/me/actors/most-watched")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      actors: [
        {
          id: 5,
          name: "Actrice Test",
          photo: "/photo.jpg",
          characterName: null,
          role: "actor",
          viewedCount: 3,
        },
      ],
    });
    expect(countMostWatched).not.toHaveBeenCalled();
  });

  it("renvoie 200 avec viewedCount et la pagination (page 1, limite 12 par défaut)", async () => {
    const readMostWatched = jest
      .spyOn(actorRepository, "readMostWatched")
      .mockResolvedValue([
        {
          ID: 5,
          name: "Actrice Test",
          photo: "/photo.jpg",
          personnage_name: null,
          role: "actor",
          viewed_count: 3,
        },
      ] as never);
    const countMostWatched = jest
      .spyOn(actorRepository, "countMostWatched")
      .mockResolvedValue(1);

    const response = await supertest(app)
      .get("/api/me/actors/most-watched?page=1")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      actors: [
        {
          id: 5,
          name: "Actrice Test",
          photo: "/photo.jpg",
          characterName: null,
          role: "actor",
          viewedCount: 3,
        },
      ],
      pagination: { page: 1, limit: 12, total: 1, hasMore: false },
    });
    expect(readMostWatched).toHaveBeenCalledWith(7, 12, 0);
    expect(countMostWatched).toHaveBeenCalledWith(7);
  });

  it("renvoie 200 et un tableau vide quand rien n'a été vu", async () => {
    jest.spyOn(actorRepository, "readMostWatched").mockResolvedValue([]);
    jest.spyOn(actorRepository, "countMostWatched").mockResolvedValue(0);

    const response = await supertest(app)
      .get("/api/me/actors/most-watched?page=1")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      actors: [],
      pagination: { page: 1, limit: 12, total: 0, hasMore: false },
    });
  });

  it("transmet page et limit au repository et signale qu'il reste des acteurs", async () => {
    const readMostWatched = jest
      .spyOn(actorRepository, "readMostWatched")
      .mockResolvedValue([
        {
          ID: 8,
          name: "Acteur Test",
          photo: null,
          personnage_name: null,
          role: "actor",
          viewed_count: 2,
        },
      ] as never);
    jest.spyOn(actorRepository, "countMostWatched").mockResolvedValue(20);

    const response = await supertest(app)
      .get("/api/me/actors/most-watched?page=2&limit=6")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      page: 2,
      limit: 6,
      total: 20,
      hasMore: true,
    });
    expect(readMostWatched).toHaveBeenCalledWith(7, 6, 6);
  });

  it("renvoie 400 pour un numéro de page invalide", async () => {
    const readMostWatched = jest.spyOn(actorRepository, "readMostWatched");

    const response = await supertest(app)
      .get("/api/me/actors/most-watched?page=0")
      .set("Authorization", authorization);

    expect(response.status).toBe(400);
    expect(readMostWatched).not.toHaveBeenCalled();
  });

  it("renvoie 400 pour une limite invalide", async () => {
    const readMostWatched = jest.spyOn(actorRepository, "readMostWatched");

    const response = await supertest(app)
      .get("/api/me/actors/most-watched?limit=51")
      .set("Authorization", authorization);

    expect(response.status).toBe(400);
    expect(readMostWatched).not.toHaveBeenCalled();
  });
});
