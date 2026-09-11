import type { RequestHandler } from "express";
import genreRepository from "./genreRepository";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const genres = await genreRepository.browse();
    res.json(genres);
  } catch (err) {
    next(err);
  }
};

export default { browse };
