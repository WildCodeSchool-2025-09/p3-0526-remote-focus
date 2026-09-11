import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { TokenPayload } from "../utils/generateToken";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token == null) {
    res.sendStatus(401);
    return;
  }

  try {
    req.user = jwt.verify(
      token,
      process.env.APP_SECRET as string,
    ) as TokenPayload;
    next();
  } catch {
    res.sendStatus(401);
  }
}
