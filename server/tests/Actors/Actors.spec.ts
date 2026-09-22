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
      media: [
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
      media: [
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
