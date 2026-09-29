import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import argon2 from "argon2";
import jwt, { type JwtPayload } from "jsonwebtoken";
import supertest from "supertest";

import app from "../../src/app";
import userRepository from "../../src/modules/user/userRepository";
import type { UserAuthRow } from "../../src/types/User/User.types";

const JWT_SECRET = "test-secret";
const PASSWORD = "Focus2026!";
const GENERIC_ERROR = "Email ou mot de passe incorrect";

let storedUser: UserAuthRow;

beforeAll(async () => {
  process.env.JWT_SECRET = JWT_SECRET;

  storedUser = {
    ID: 1,
    firstname: "Test",
    lastname: null,
    email: "test@example.com",
    login: "test-user",
    avatar: null,
    role: "user",
    hashed_password: await argon2.hash(PASSWORD),
  } as unknown as UserAuthRow;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("POST /api/auth/login", () => {
  it("returns 200 with the user and a token when credentials are valid", async () => {
    jest.spyOn(userRepository, "readByEmail").mockResolvedValue(storedUser);

    const response = await supertest(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      id: 1,
      firstName: "Test",
      lastName: null,
      email: "test@example.com",
      login: "test-user",
      avatar: null,
      role: "user",
    });
    expect(response.body.user).not.toHaveProperty("hashed_password");

    const payload = jwt.verify(response.body.token, JWT_SECRET) as JwtPayload;

    expect(payload.id).toBe(1);
  });

  it("returns 401 when the password is wrong", async () => {
    jest.spyOn(userRepository, "readByEmail").mockResolvedValue(storedUser);

    const response = await supertest(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrong-password" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: GENERIC_ERROR });
  });

  it("returns 401 with the same message when the email is unknown", async () => {
    jest.spyOn(userRepository, "readByEmail").mockResolvedValue(null);

    const response = await supertest(app)
      .post("/api/auth/login")
      .send({ email: "unknown@example.com", password: PASSWORD });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: GENERIC_ERROR });
  });

  it("returns 400 when the password is missing", async () => {
    const readByEmailSpy = jest.spyOn(userRepository, "readByEmail");

    const response = await supertest(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com" });

    expect(response.status).toBe(400);
    expect(readByEmailSpy).not.toHaveBeenCalled();
  });
});
