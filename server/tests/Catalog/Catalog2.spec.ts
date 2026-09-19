import { afterEach, describe, expect, it, jest } from "@jest/globals";
import type { RowDataPacket } from "mysql2";
import supertest from "supertest";
import databaseClient from "../../database/client";
import type { Rows } from "../../database/client";
import app from "../../src/app";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET api/medias", () => {
  it("should return error : 400 on invalid type", async () => {
    const response = await supertest(app).get("/api/medias?type=fdsfdsd");
    expect(response.status).toBe(400);
  });
  it("should return error : 400 on invalid page", async () => {
    const response = await supertest(app).get("/api/medias?page=0");
    expect(response.status).toBe(400);
  });
  it("should return error : 400 on invalid genre", async () => {
    const response = await supertest(app).get("/api/medias?genre=fdsqfd");
    expect(response.status).toBe(400);
  });
  it("should return http 200 status on valid type", async () => {
    jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([
        [{ total: 0 } as RowDataPacket & { total: number }],
        [],
      ]);
    const response = await supertest(app).get("/api/medias?type=movie");
    expect(response.status).toBe(200);
  });
  it("should return 3 pages for 31 medias on valid type", async () => {
    jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([
        [{ total: 31 } as RowDataPacket & { total: number }],
        [],
      ]);

    const response = await supertest(app).get("/api/medias?type=anime");

    expect(response.status).toBe(200);

    expect(response.body.pagination.total).toBe(31);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(15);
    expect(response.body.pagination.totalPages).toBe(3);
  });
  it("should pass on valid page request", async () => {
    jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([
        [{ total: 31 } as RowDataPacket & { total: number }],
        [],
      ]);
    const response = await supertest(app).get("/api/medias?type=movie&page=2");
    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.totalPages).toBe(3);
  });
  it("should pass on multiple genres requested", async () => {
    jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([
        [{ total: 31 } as RowDataPacket & { total: number }],
        [],
      ]);
    const response = await supertest(app).get("/api/medias?genre=2,5,8");
    expect(response.status).toBe(200);
  });
  it("should pass multiple genres to the database", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([
        [{ total: 10 } as RowDataPacket & { total: number }],
        [],
      ]);

    const response = await supertest(app).get("/api/medias?genre=2,5,8");

    expect(response.status).toBe(200);

    expect(queryMock).toHaveBeenNthCalledWith(1, expect.any(String), [
      null,
      null,
      null,
      null,
      2,
      5,
      8,
      15,
      0,
    ]);
  });
});
describe("GET api/genres", () => {
  it("should return http 200 status with valid datas", async () => {
    const rows = [] as Rows;
    jest
      .spyOn(databaseClient, "query")
      .mockImplementation(async () => [rows, []]);
    const response = await supertest(app).get("/api/genres");
    expect(response.status).toBe(200);
    expect(response.body.genreList).toEqual([]);
  });
});
