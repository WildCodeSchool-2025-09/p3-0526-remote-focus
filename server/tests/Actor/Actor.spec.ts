import { afterEach, describe, expect, it, jest } from "@jest/globals";
import supertest from "supertest";
import databaseClient from "../../database/client";
import type { Rows } from "../../database/client";
import app from "../../src/app";

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
