import request from "supertest";

import databaseClient from "../../database/client";
import app from "../../src/app";

import type { Rows } from "../../database/client";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /api/medias/home", () => {
  it("should return homepage medias", async () => {
    const rows = [] as unknown as Rows;

    jest.spyOn(databaseClient, "query").mockResolvedValue([rows, []]);

    const response = await request(app).get("/api/medias/home");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("films");
    expect(response.body).toHaveProperty("series");
    expect(response.body).toHaveProperty("animes");
  });
});
