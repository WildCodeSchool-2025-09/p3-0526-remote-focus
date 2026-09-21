import type { RequestHandler } from "express";

import genreRepository from "./genreRepository";

const browse: RequestHandler = async (_req, res, next) => {
  try {
    const genres = await genreRepository.readAll();

    res.json(genres);
  } catch (error) {
    next(error);
  }
};

export default { browse };
