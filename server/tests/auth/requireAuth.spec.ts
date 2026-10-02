import { describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";

import requireAuth from "../../src/middlewares/requireAuth";

function runMiddleware(req: Request) {
  const res = { sendStatus: jest.fn() };
  const next = jest.fn();

  requireAuth(req, res as unknown as Response, next as unknown as NextFunction);

  return { res, next };
}

describe("requireAuth middleware", () => {
  it("calls next when the user is authenticated", () => {
    const req = { user: { id: 2 } } as unknown as Request;

    const { res, next } = runMiddleware(req);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.sendStatus).not.toHaveBeenCalled();
  });

  it("returns 401 when the user is not authenticated", () => {
    const req = {} as unknown as Request;

    const { res, next } = runMiddleware(req);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
