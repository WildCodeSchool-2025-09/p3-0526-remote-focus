import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import supertest from "supertest";

import app from "../../src/app";
import userRepository from "../../src/modules/user/userRepository";

const JWT_SECRET = "test-secret";

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

afterEach(() => {
  jest.restoreAllMocks();
});

const token = jwt.sign({ id: 1 }, JWT_SECRET);

describe("PATCH /api/me/login", () => {
  it("should return 401 when no token is provided", async () => {
    const response = await supertest(app)
      .patch("/api/me/login")
      .send({ login: "newlogin" });

    expect(response.status).toBe(401);
  });

  it("should return 409 when the login is already taken", async () => {
    jest.spyOn(userRepository, "findByLogin").mockResolvedValue(true);

    const response = await supertest(app)
      .patch("/api/me/login")
      .set("Authorization", `Bearer ${token}`)
      .send({ login: "taken" });

    expect(response.status).toBe(409);
  });

  it("should return 200 and update the login", async () => {
    jest.spyOn(userRepository, "findByLogin").mockResolvedValue(false);
    const updateLoginSpy = jest
      .spyOn(userRepository, "updateLogin")
      .mockResolvedValue();

    const response = await supertest(app)
      .patch("/api/me/login")
      .set("Authorization", `Bearer ${token}`)
      .send({ login: "newlogin" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ login: "newlogin" });
    expect(updateLoginSpy).toHaveBeenCalledWith(1, "newlogin");
  });
});

describe("PATCH /api/me/email", () => {
  it("should return 401 when no token is provided", async () => {
    const response = await supertest(app)
      .patch("/api/me/email")
      .send({ email: "new@example.com" });

    expect(response.status).toBe(401);
  });

  it("should return 409 when the email is already taken", async () => {
    jest.spyOn(userRepository, "findByEmail").mockResolvedValue(true);

    const response = await supertest(app)
      .patch("/api/me/email")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "taken@example.com" });

    expect(response.status).toBe(409);
  });

  it("should return 200 and update the email", async () => {
    jest.spyOn(userRepository, "findByEmail").mockResolvedValue(false);
    const updateEmailSpy = jest
      .spyOn(userRepository, "updateEmail")
      .mockResolvedValue();

    const response = await supertest(app)
      .patch("/api/me/email")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "new@example.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ email: "new@example.com" });
    expect(updateEmailSpy).toHaveBeenCalledWith(1, "new@example.com");
  });
});

describe("PATCH /api/me/password", () => {
  it("should return 401 when no token is provided", async () => {
    const response = await supertest(app)
      .patch("/api/me/password")
      .send({ currentPassword: "oldpassword", newPassword: "newpassword123" });

    expect(response.status).toBe(401);
  });

  it("should return 400 when the current password is wrong", async () => {
    jest
      .spyOn(userRepository, "readHashedPasswordById")
      .mockResolvedValue(await argon2.hash("oldpassword"));

    const response = await supertest(app)
      .patch("/api/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "wrongpassword",
        newPassword: "newpassword123",
      });

    expect(response.status).toBe(400);
  });

  it("should return 204 and update the password", async () => {
    jest
      .spyOn(userRepository, "readHashedPasswordById")
      .mockResolvedValue(await argon2.hash("oldpassword"));
    const updatePasswordSpy = jest
      .spyOn(userRepository, "updatePassword")
      .mockResolvedValue();

    const response = await supertest(app)
      .patch("/api/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "oldpassword", newPassword: "newpassword123" });

    expect(response.status).toBe(204);
    expect(updatePasswordSpy).toHaveBeenCalledWith(1, expect.any(String));
  });
});
