import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { TokenPayload } from "../utils/generateToken";

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token != null) {
    try {
      req.user = jwt.verify(
        token,
        process.env.APP_SECRET as string,
      ) as TokenPayload;
    } catch {
      // Token invalide/expiré : on continue en mode visiteur plutôt que de bloquer.
    }
  }

  next();
}
