import type { NextFunction, Request, Response } from "express";
import requireAuth from "../../src/middlewares/requireAuth";

const createResponse = () =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }) as unknown as Response;

describe("requireAuth middleware", () => {
  test("renvoie 401 sans utilisateur authentifié", () => {
    const req = {} as unknown as Request;
    const res = createResponse();
    const next = jest.fn();

    requireAuth(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Authentification requise.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("passe à la suite quand l'utilisateur est authentifié", () => {
    const req = { user: { id: 1 } } as unknown as Request;
    const res = createResponse();
    const next = jest.fn();

    requireAuth(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
