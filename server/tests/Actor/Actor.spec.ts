import { afterEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import supertest from "supertest";
import databaseClient from "../../database/client";
import type { Rows } from "../../database/client";
import app from "../../src/app";
import actorActions from "../../src/modules/actor/actorActions";
import actorRepository from "../../src/modules/actor/actorRepository";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /api/actors/:id", () => {
  it("should return 400 on invalid id", async () => {
    const response = await supertest(app).get("/api/actors/abc");
    expect(response.status).toBe(400);
  });

  it("should return 404 when the actor is not found", async () => {
    jest
      .spyOn(databaseClient, "query")
      .mockImplementationOnce(async () => [[] as Rows, []]);

    const response = await supertest(app).get("/api/actors/999");
    expect(response.status).toBe(404);
  });

  it("should return the actor on a valid id", async () => {
    const rows = [
      {
        ID: 1,
        name: "Gérard Menvussa",
        photo: "/Gerard.jpg",
        biography: "Formé au théâtre...",
      },
    ] as Rows;
    jest
      .spyOn(databaseClient, "query")
      .mockImplementationOnce(async () => [rows, []]);

    const response = await supertest(app).get("/api/actors/1");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1,
      name: "Gérard Menvussa",
      photo: "/Gerard.jpg",
      biography: "Formé au théâtre...",
    });
  });

  it("should return null fields instead of an error when data is missing", async () => {
    const rows = [
      {
        ID: 2,
        name: "Gérard Menvussa",
        photo: null,
        biography: null,
      },
    ] as Rows;
    jest
      .spyOn(databaseClient, "query")
      .mockImplementationOnce(async () => [rows, []]);

    const response = await supertest(app).get("/api/actors/2");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 2,
      name: "Gérard Menvussa",
      photo: null,
      biography: null,
    });
  });
});

const buildFilmographyRows = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    ID: index + 1,
    name: `Film ${index + 1}`,
    personnage_name: "Le Frère",
  })) as Rows;

const mockFilmographyQueries = (items: Rows, total: number) =>
  jest
    .spyOn(databaseClient, "query")
    .mockImplementationOnce(async () => [items, []])
    .mockImplementationOnce(async () => [[{ total }] as Rows, []]);

describe("GET /api/actors/:id/filmography", () => {
  it("should return 400 on invalid id", async () => {
    const response = await supertest(app).get("/api/actors/abc/filmography");
    expect(response.status).toBe(400);
  });

  it("should return an empty page when the actor has no work", async () => {
    mockFilmographyQueries([] as Rows, 0);

    const response = await supertest(app).get("/api/actors/1/filmography");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [], hasMore: false });
  });

  it("should return the first 6 works with hasMore true when more remain", async () => {
    const querySpy = mockFilmographyQueries(buildFilmographyRows(6), 8);

    const response = await supertest(app).get("/api/actors/1/filmography");
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(6);
    expect(response.body.items[0].characterName).toBe("Le Frère");
    expect(response.body.hasMore).toBe(true);
    expect(querySpy.mock.calls[0][1]).toEqual([1, 0, 6, 0]);
  });

  it("should return the last page with hasMore false", async () => {
    const querySpy = mockFilmographyQueries(buildFilmographyRows(2), 8);

    const response = await supertest(app).get(
      "/api/actors/1/filmography?page=2",
    );
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.hasMore).toBe(false);
    expect(querySpy.mock.calls[0][1]).toEqual([1, 0, 6, 6]);
  });

  it("should fall back to the first page when page is invalid", async () => {
    const querySpy = mockFilmographyQueries(buildFilmographyRows(6), 8);

    const response = await supertest(app).get(
      "/api/actors/1/filmography?page=-3",
    );
    expect(response.status).toBe(200);
    expect(querySpy.mock.calls[0][1]).toEqual([1, 0, 6, 0]);
  });

  it("should exclude the given media from the results and the count", async () => {
    const querySpy = mockFilmographyQueries(buildFilmographyRows(3), 3);

    const response = await supertest(app).get(
      "/api/actors/1/filmography?exclude=45",
    );
    expect(response.status).toBe(200);
    expect(response.body.hasMore).toBe(false);
    expect(querySpy.mock.calls[0][1]).toEqual([1, 45, 6, 0]);
    expect(querySpy.mock.calls[1][1]).toEqual([1, 45]);
  });
});

describe("GET api/actors/:id/known-for", () => {
  it("should return error : 400 on id not a number", async () => {
    const response = await supertest(app).get("/api/actors/abc/known-for");

    expect(response.status).toBe(400);
  });
  it("should return http 200 status on valid query", async () => {
    jest.spyOn(databaseClient, "query").mockResolvedValueOnce([[], []]);
    const response = await supertest(app).get("/api/actors/5/known-for");
    expect(response.status).toBe(200);
  });
  it("should return character names as an array", async () => {
    const rows = [
      {
        ID: 852,
        name: "Berserk",
        poster: "/poster.jpg",
        type: "tv",
        released_at: "1997-10-07",
        characterNames: "Soldier C (voice), Guard (voice)",
      },
    ] as Rows;

    jest.spyOn(databaseClient, "query").mockResolvedValueOnce([rows, []]);

    const response = await supertest(app).get("/api/actors/78218/known-for");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      mode: "top-rated",
      medias: [
        {
          id: 852,
          name: "Berserk",
          poster: "/poster.jpg",
          type: "tv",
          releasedAt: "1997-10-07",
          characterNames: ["Soldier C (voice)", "Guard (voice)"],
        },
      ],
      pagination: null,
    });
  });
  it("should return medias already seen by the connected user", async () => {
    const rows = [
      {
        ID: 852,
        name: "Berserk",
        poster: "/poster.jpg",
        type: "tv",
        released_at: "1997-10-07",
        characterNames: "Soldier C (voice), Guard (voice)",
      },
    ] as Rows;

    jest
      .spyOn(actorRepository, "readSeenWithActor")
      .mockResolvedValueOnce(rows);

    jest
      .spyOn(actorRepository, "countSeenMediaByActor")
      .mockResolvedValueOnce(25);

    const req = {
      params: {
        id: "78218",
      },
      query: {
        exclude: "852",
      },
      user: {
        id: 3,
      },
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    await actorActions.readKnownFor(req, res, next);

    expect(actorRepository.readSeenWithActor).toHaveBeenCalledWith(
      78218,
      3,
      852,
      10,
      0,
    );

    expect(actorRepository.countSeenMediaByActor).toHaveBeenCalledWith(
      78218,
      3,
      852,
    );

    expect(res.json).toHaveBeenCalledWith({
      mode: "seen",
      medias: [
        {
          id: 852,
          name: "Berserk",
          poster: "/poster.jpg",
          type: "tv",
          releasedAt: "1997-10-07",
          characterNames: ["Soldier C (voice)", "Guard (voice)"],
        },
      ],
      pagination: {
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      },
    });
  });
  it("should use the correct offset for page 2", async () => {
    jest.spyOn(actorRepository, "readSeenWithActor").mockResolvedValue([]);

    jest
      .spyOn(actorRepository, "countSeenMediaByActor")
      .mockResolvedValueOnce(25);

    const req = {
      params: {
        id: "78218",
      },
      query: {
        exclude: "852",
        page: "2",
      },
      user: {
        id: 3,
      },
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    await actorActions.readKnownFor(req, res, next);

    expect(actorRepository.readSeenWithActor).toHaveBeenCalledWith(
      78218,
      3,
      852,
      10,
      10,
    );
  });
});
