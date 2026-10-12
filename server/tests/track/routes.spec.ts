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
import favoriteRepository from "../../src/modules/favorite/favoriteRepository";
import mediaRepository from "../../src/modules/media/mediaRepository";
import trackRepository from "../../src/modules/track/trackRepository";

const JWT_SECRET = "test-secret";

let authorization: string;

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;

  authorization = `Bearer ${jwt.sign({ id: 1 }, JWT_SECRET)}`;
});

afterEach(() => {
  jest.restoreAllMocks();
});

const protectedRoutes: ["get" | "patch", string][] = [
  ["get", "/api/me/tracks"],
  ["get", "/api/me/actors/favorites"],
  ["patch", "/api/me/medias/10/favorite"],
  ["patch", "/api/me/medias/10/watchlist"],
  ["patch", "/api/me/actors/5/favorite"],
];

describe("routes /api/me protégées par requireAuth", () => {
  it.each(protectedRoutes)(
    "%s %s renvoie 401 sans token",
    async (method, path) => {
      const response = await supertest(app)[method](path);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Authentification requise." });
    },
  );

  it("renvoie 401 avec un token invalide", async () => {
    const response = await supertest(app)
      .get("/api/me/tracks")
      .set("Authorization", `Bearer ${jwt.sign({ id: 1 }, "wrong-secret")}`);

    expect(response.status).toBe(401);
  });
});

describe("GET /api/me/tracks", () => {
  it("renvoie 200 avec les suivis de l'utilisateur du token", async () => {
    const tracks = [{ mediaId: 10, isFavorite: true, isInWatchlist: false }];
    const readAllSpy = jest
      .spyOn(trackRepository, "readAll")
      .mockResolvedValue(tracks);

    const response = await supertest(app)
      .get("/api/me/tracks")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(tracks);
    expect(readAllSpy).toHaveBeenCalledWith(1);
  });
});

describe("PATCH /api/me/medias/:id/favorite et /watchlist", () => {
  it("renvoie 400 pour un identifiant invalide", async () => {
    const readSpy = jest.spyOn(mediaRepository, "read");

    const response = await supertest(app)
      .patch("/api/me/medias/abc/favorite")
      .set("Authorization", authorization);

    expect(response.status).toBe(400);
    expect(readSpy).not.toHaveBeenCalled();
  });

  it("renvoie 404 pour un média inexistant", async () => {
    jest.spyOn(mediaRepository, "read").mockResolvedValue(null);
    const toggleSpy = jest.spyOn(trackRepository, "toggleFavorite");

    const response = await supertest(app)
      .patch("/api/me/medias/999/favorite")
      .set("Authorization", authorization);

    expect(response.status).toBe(404);
    expect(toggleSpy).not.toHaveBeenCalled();
  });

  it("bascule le favori d'un média existant", async () => {
    const track = { mediaId: 10, isFavorite: true, isInWatchlist: false };
    jest.spyOn(mediaRepository, "read").mockResolvedValue({ ID: 10 } as never);
    const toggleSpy = jest
      .spyOn(trackRepository, "toggleFavorite")
      .mockResolvedValue(track);

    const response = await supertest(app)
      .patch("/api/me/medias/10/favorite")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(track);
    expect(toggleSpy).toHaveBeenCalledWith(1, 10);
  });

  it("bascule la watchlist d'un média existant", async () => {
    const track = { mediaId: 10, isFavorite: false, isInWatchlist: true };
    jest.spyOn(mediaRepository, "read").mockResolvedValue({ ID: 10 } as never);
    const toggleSpy = jest
      .spyOn(trackRepository, "toggleWatchlist")
      .mockResolvedValue(track);

    const response = await supertest(app)
      .patch("/api/me/medias/10/watchlist")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(track);
    expect(toggleSpy).toHaveBeenCalledWith(1, 10);
  });
});

describe("routes favoris d'acteurs", () => {
  it("GET /api/me/actors/favorites renvoie 200", async () => {
    const favorites = [{ actorId: 5, isFavorite: true }];
    jest.spyOn(favoriteRepository, "readAll").mockResolvedValue(favorites);

    const response = await supertest(app)
      .get("/api/me/actors/favorites")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(favorites);
  });

  it("PATCH /api/me/actors/:id/favorite renvoie 404 pour un acteur inexistant", async () => {
    jest.spyOn(actorRepository, "read").mockResolvedValue(null as never);

    const response = await supertest(app)
      .patch("/api/me/actors/999/favorite")
      .set("Authorization", authorization);

    expect(response.status).toBe(404);
  });

  it("PATCH /api/me/actors/:id/favorite bascule le favori d'un acteur existant", async () => {
    jest.spyOn(actorRepository, "read").mockResolvedValue({ ID: 5 } as never);
    const toggleSpy = jest
      .spyOn(favoriteRepository, "toggleFavorite")
      .mockResolvedValue({ actorId: 5, isFavorite: true });

    const response = await supertest(app)
      .patch("/api/me/actors/5/favorite")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ actorId: 5, isFavorite: true });
    expect(toggleSpy).toHaveBeenCalledWith(1, 5);
  });
});
