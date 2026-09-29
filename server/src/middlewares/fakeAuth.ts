import type { RequestHandler } from "express";

const fakeAuth: RequestHandler = (req, _res, next) => {
  req.user = {
    id: 1,
  };

  next();
};

export default fakeAuth;
