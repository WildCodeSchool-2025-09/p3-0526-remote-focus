import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import optionalAuth from "../../src/middlewares/optionalAuth";

const JWT_SECRET = "test-secret";

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

function createRequest(authorization?: string): Request {
  return {
    get: (name: string) =>
      name.toLowerCase() === "authorization" ? authorization : undefined,
  } as unknown as Request;
}

function runMiddleware(req: Request) {
  const next = jest.fn();

  optionalAuth(req, {} as Response, next as unknown as NextFunction);

  return next;
}

describe("optionalAuth middleware", () => {
  it("sets req.user when the token is valid", () => {
    const token = jwt.sign(
      { id: 2, login: "tester", role: "user" },
      JWT_SECRET,
    );
    const req = createRequest(`Bearer ${token}`);

    const next = runMiddleware(req);

    expect(req.user).toEqual({ id: 2 });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("continues as a visitor when there is no Authorization header", () => {
    const req = createRequest();

    const next = runMiddleware(req);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("continues as a visitor when the header is not a Bearer token", () => {
    const req = createRequest("Basic abc123");

    const next = runMiddleware(req);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("continues as a visitor when the token is signed with another secret", () => {
    const token = jwt.sign({ id: 2 }, "wrong-secret");
    const req = createRequest(`Bearer ${token}`);

    const next = runMiddleware(req);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("continues as a visitor when the token is expired", () => {
    const expiredAt = Math.floor(Date.now() / 1000) - 60;
    const token = jwt.sign({ id: 2, exp: expiredAt }, JWT_SECRET);
    const req = createRequest(`Bearer ${token}`);

    const next = runMiddleware(req);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
