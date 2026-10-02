import type { RequestHandler } from "express";

// À placer sur les routes réservées aux utilisateurs connectés.
// S'appuie sur optionalAuth (appliqué à toutes les routes dans router.ts),
// qui remplit req.user lorsque le token est valide.
const requireAuth: RequestHandler = (req, res, next) => {
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  next();
};

export default requireAuth;
