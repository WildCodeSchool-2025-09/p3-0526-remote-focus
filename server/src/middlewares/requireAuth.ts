import type { RequestHandler } from "express";

const requireAuth: RequestHandler = (req, res, next) => {
  if (req.user === undefined) {
    res.status(401).json({
      error: "Authentification requise.",
    });
    return;
  }

  next();
};

export default requireAuth;
