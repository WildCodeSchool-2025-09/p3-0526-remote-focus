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
import favoriteRepository from "../../src/modules/favorite/favoriteRepository";

const JWT_SECRET = "test-secret";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /api/me/favorite-actors", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it("renvoie 401 sans token", async () => {
    const response = await supertest(app).get("/api/me/favorite-actors");

    expect(response.status).toBe(401);
  });

  it("renvoie 200 avec les acteurs favoris de l'utilisateur connecté", async () => {
    const token = jwt.sign({ id: 1 }, JWT_SECRET);

    jest
      .spyOn(favoriteRepository, "readFavoriteActors")
      .mockResolvedValue([
        { ID: 7, name: "Jamie Martz", photo: "/jamie.jpg", viewed_count: 2 },
      ] as never);
    jest.spyOn(favoriteRepository, "countFavoriteActors").mockResolvedValue(1);

    const response = await supertest(app)
      .get("/api/me/favorite-actors?page=1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(favoriteRepository.readFavoriteActors).toHaveBeenCalledWith(1, 6, 0);
    expect(response.body).toEqual({
      data: [
        { id: 7, name: "Jamie Martz", photo: "/jamie.jpg", viewedCount: 2 },
      ],
      pagination: { page: 1, limit: 6, total: 1, hasMore: false },
    });
  });
});
