import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const optionalAuth: RequestHandler = (req, _res, next) => {
  const authorization = req.get("Authorization");

  if (authorization === undefined || !authorization.startsWith("Bearer ")) {
    next();
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    next();
    return;
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    if (typeof payload.id === "number") {
      req.user = { id: payload.id };
    }
  } catch {
    // Token invalide ou expiré : on continue en visiteur.
  }

  next();
};

export default optionalAuth;
