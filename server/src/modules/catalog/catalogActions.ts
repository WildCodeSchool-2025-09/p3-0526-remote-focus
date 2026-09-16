import type { RequestHandler } from "express";

import userRepository from "../user/userRepository";
import { createGenreSections, enrichRanking } from "./catalogHelpers";
import catalogRepository from "./catalogRepository";

const readDiscoverSections: RequestHandler = async (req, res, next) => {
  try {
    const requestedType = req.query.type;

    if (
      requestedType !== undefined &&
      requestedType !== "movie" &&
      requestedType !== "tv" &&
      requestedType !== "anime"
    ) {
      res.status(400).json({
        error: "Invalid media type",
      });
      return;
    }

    const type = requestedType ? requestedType : null;

    const userId = req.user?.id;

    const topRated = await catalogRepository.readTopRated(type);

    const newReleases = await catalogRepository.readLatest90Days(type);

    const likedGenres = await userRepository.readRandomGenres(userId);

    const topGenres = await Promise.all(
      likedGenres.map((likedGenre) =>
        catalogRepository.readTopByGenre(likedGenre.id, type),
      ),
    );

    const enrichedTopRated = enrichRanking(topRated);

    const genreSections = createGenreSections(
      likedGenres,
      topGenres,
      enrichedTopRated,
    );

    res.json({
      topRated: enrichedTopRated,
      latest: newReleases,
      genreSections,
    });
  } catch (err) {
    next(err);
  }
};

export const browse: RequestHandler = async (req, res, next) => {
  try {
    const requestedType = req.query.type;
    const requestedGenre = req.query.genre?.toString();
    const requestedPage = req.query.page;

    if (
      requestedType !== undefined &&
      requestedType !== "movie" &&
      requestedType !== "tv" &&
      requestedType !== "anime"
    ) {
      res.status(400).json({
        error: "Invalid media type",
      });
      return;
    }

    const genreIds = requestedGenre
      ? requestedGenre.split(",").map((genre) => Number(genre))
      : null;
    const type = requestedType ? requestedType : null;
    const page = requestedPage ? Number(requestedPage) : 1;
    const limit = 15;
    const offset = (page - 1) * limit;

    if (!Number.isInteger(page) || page < 1) {
      res.status(400).json({ error: "Invalid page number" });
      return;
    }

    if (genreIds?.some((genreId) => Number.isNaN(genreId) || genreId <= 0)) {
      res.status(400).json({ error: "Invalid genre ID" });
      return;
    }
    res.json({
      type,
      genreIds,
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
};

export default { readDiscoverSections, browse };
