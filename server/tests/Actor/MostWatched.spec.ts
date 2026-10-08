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

  it("renvoie 200 au format CastMember avec l'utilisateur du token et la limite 12", async () => {
    const readMostWatched = jest
      .spyOn(actorRepository, "readMostWatched")
      .mockResolvedValue([
        {
          ID: 5,
          name: "Actrice Test",
          photo: "/photo.jpg",
          personnage_name: null,
          role: "actor",
        },
      ] as never);

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
        },
      ],
    });
    expect(readMostWatched).toHaveBeenCalledWith(7, 12);
  });

  it("renvoie 200 et un tableau vide quand rien n'a été vu", async () => {
    jest.spyOn(actorRepository, "readMostWatched").mockResolvedValue([]);

    const response = await supertest(app)
      .get("/api/me/actors/most-watched")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ actors: [] });
  });
});
