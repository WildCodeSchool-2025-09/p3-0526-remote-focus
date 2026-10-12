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
import trackRepository from "../../src/modules/track/trackRepository";
import userRepository from "../../src/modules/user/userRepository";

const JWT_SECRET = "test-secret";

afterEach(() => {
  jest.restoreAllMocks();
});

const validUser = {
  firstName: "Test",
  lastName: null,
  email: "test@example.com",
  bornAt: "2000-01-01",
  login: "test-user",
  password: "password123",
  genreIds: [],
};

describe("POST /api/users", () => {
  it("should return 201 when the user is created", async () => {
    jest.spyOn(userRepository, "findByEmail").mockResolvedValue(false);
    jest.spyOn(userRepository, "findByLogin").mockResolvedValue(false);
    jest.spyOn(userRepository, "create").mockResolvedValue(1);
    jest.spyOn(userRepository, "addLikedGenres").mockResolvedValue();

    const response = await supertest(app).post("/api/users").send(validUser);

    expect(response.status).toBe(201);
  });

  it("should return 409 when the email already exists", async () => {
    jest.spyOn(userRepository, "findByEmail").mockResolvedValue(true);

    const response = await supertest(app).post("/api/users").send(validUser);

    expect(response.status).toBe(409);
  });
});

describe("GET /api/me/dashboard", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it("should return 401 when no token is provided", async () => {
    const response = await supertest(app).get("/api/me/dashboard");

    expect(response.status).toBe(401);
  });

  it("should return 200 with the profile and counts when the token is valid", async () => {
    const token = jwt.sign({ id: 1 }, JWT_SECRET);

    jest.spyOn(userRepository, "readProfile").mockResolvedValue({
      login: "camille98",
      avatar: "/avatar.jpg",
      created_at: "2025-03-01T00:00:00.000Z",
    } as never);
    jest.spyOn(trackRepository, "countFavoriteMedias").mockResolvedValue(24);
    jest.spyOn(trackRepository, "countWatchlist").mockResolvedValue(8);
    jest.spyOn(favoriteRepository, "countFavoriteActors").mockResolvedValue(12);

    const response = await supertest(app)
      .get("/api/me/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      profile: {
        name: "camille98",
        avatar: "/avatar.jpg",
        createdAt: "2025-03-01T00:00:00.000Z",
      },
      counts: { favorites: 24, watchlist: 8, actors: 12 },
    });
  });
});
