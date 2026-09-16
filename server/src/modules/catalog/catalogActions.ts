import type { RequestHandler } from "express";

import catalogRepository from "./catalogRepository";
import userRepository from "../user/userRepository";
import { createGenreSections, enrichRanking } from "./catalogHelpers";

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

export default { readDiscoverSections };
