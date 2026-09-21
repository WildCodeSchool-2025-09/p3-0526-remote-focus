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

const buildFilmographyRows = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Film ${index + 1}`,
    characterName: "Le Frère",
  })) as Rows;

const mockFilmographyQueries = (items: Rows, total: number) =>
  jest
    .spyOn(databaseClient, "query")
    .mockImplementationOnce(async () => [items, []])
    .mockImplementationOnce(async () => [[{ total }] as Rows, []]);

describe("GET /api/actors/:id/filmography", () => {
  it("should return 400 on invalid id", async () => {
    const response = await supertest(app).get("/api/actors/abc/filmography");
    expect(response.status).toBe(400);
  });

  it("should return an empty page when the actor has no work", async () => {
    mockFilmographyQueries([] as Rows, 0);

    const response = await supertest(app).get("/api/actors/1/filmography");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [], hasMore: false });
  });

  it("should return the first 6 works with hasMore true when more remain", async () => {
    const querySpy = mockFilmographyQueries(buildFilmographyRows(6), 8);

    const response = await supertest(app).get("/api/actors/1/filmography");
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(6);
    expect(response.body.items[0].characterName).toBe("Le Frère");
    expect(response.body.hasMore).toBe(true);
    expect(querySpy.mock.calls[0][1]).toEqual([1, 0, 6, 0]);
  });

  it("should return the last page with hasMore false", async () => {
    const querySpy = mockFilmographyQueries(buildFilmographyRows(2), 8);

    const response = await supertest(app).get(
      "/api/actors/1/filmography?page=2",
    );
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.hasMore).toBe(false);
    expect(querySpy.mock.calls[0][1]).toEqual([1, 0, 6, 6]);
  });

  it("should fall back to the first page when page is invalid", async () => {
    const querySpy = mockFilmographyQueries(buildFilmographyRows(6), 8);

    const response = await supertest(app).get(
      "/api/actors/1/filmography?page=-3",
    );
    expect(response.status).toBe(200);
    expect(querySpy.mock.calls[0][1]).toEqual([1, 0, 6, 0]);
  });

  it("should exclude the given media from the results and the count", async () => {
    const querySpy = mockFilmographyQueries(buildFilmographyRows(3), 3);

    const response = await supertest(app).get(
      "/api/actors/1/filmography?exclude=45",
    );
    expect(response.status).toBe(200);
    expect(response.body.hasMore).toBe(false);
    expect(querySpy.mock.calls[0][1]).toEqual([1, 45, 6, 0]);
    expect(querySpy.mock.calls[1][1]).toEqual([1, 45]);
  });
});
