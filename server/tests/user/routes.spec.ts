import { afterEach, describe, expect, it, jest } from "@jest/globals";
import supertest from "supertest";

import app from "../../src/app";
import userRepository from "../../src/modules/user/userRepository";

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
