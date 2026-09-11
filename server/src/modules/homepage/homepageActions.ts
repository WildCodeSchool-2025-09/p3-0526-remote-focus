import type { RequestHandler } from "express";
import { resolveHidePegi16 } from "../../utils/applyPegiFilter";
import { enrichRanking } from "../../utils/enrichRanking";
import catalogRepository from "../catalog/catalogRepository";

const POPULAR_LIMIT = 20;
const CATEGORY_LIMIT = 20;

const readSections: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const hidePegi16 = await resolveHidePegi16(userId);

    const [popular, movies, series, animes] = await Promise.all([
      catalogRepository.readTopRated(null, hidePegi16, POPULAR_LIMIT),
      catalogRepository.readTopRated("movie", hidePegi16, CATEGORY_LIMIT),
      catalogRepository.readTopRated("tv", hidePegi16, CATEGORY_LIMIT),
      catalogRepository.readTopRated("anime", hidePegi16, CATEGORY_LIMIT),
    ]);

    res.json({
      popular: enrichRanking(popular),
      movies: enrichRanking(movies),
      series: enrichRanking(series),
      animes: enrichRanking(animes),
    });
  } catch (err) {
    next(err);
  }
};

export default { readSections };
