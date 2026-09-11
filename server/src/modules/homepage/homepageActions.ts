import type { RequestHandler } from "express";
import { resolveHidePegi16 } from "../../utils/applyPegiFilter";
import { enrichRanking } from "../../utils/enrichRanking";
import catalogRepository from "../catalog/catalogRepository";
import trackRepository from "../track/trackRepository";
import userRepository from "../user/userRepository";

const POPULAR_LIMIT = 20;
const CATEGORY_LIMIT = 20;
const NEW_RELEASES_LIMIT = 20;

async function resolvePersonalizationGenreIds(
  userId: number | undefined,
): Promise<number[]> {
  if (userId == null) {
    return [];
  }

  const [likedGenres, trackedGenreIds] = await Promise.all([
    userRepository.readPreferences(userId),
    trackRepository.readTrackedGenreIds(userId),
  ]);

  return Array.from(
    new Set([...likedGenres.map((genre) => genre.id), ...trackedGenreIds]),
  );
}

const readSections: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const hidePegi16 = await resolveHidePegi16(userId);
    const personalizationGenreIds =
      await resolvePersonalizationGenreIds(userId);

    const [popular, movies, series, animes, personalizedNewReleases] =
      await Promise.all([
        catalogRepository.readTopRated(null, hidePegi16, POPULAR_LIMIT),
        catalogRepository.readTopRated("movie", hidePegi16, CATEGORY_LIMIT),
        catalogRepository.readTopRated("tv", hidePegi16, CATEGORY_LIMIT),
        catalogRepository.readTopRated("anime", hidePegi16, CATEGORY_LIMIT),
        catalogRepository.readRecentReleases(
          hidePegi16,
          personalizationGenreIds,
          NEW_RELEASES_LIMIT,
        ),
      ]);

    const newReleases =
      personalizedNewReleases.length > 0
        ? personalizedNewReleases
        : await catalogRepository.readRecentReleases(
            hidePegi16,
            [],
            NEW_RELEASES_LIMIT,
          );

    res.json({
      popular: enrichRanking(popular),
      movies: enrichRanking(movies),
      series: enrichRanking(series),
      animes: enrichRanking(animes),
      newReleases: enrichRanking(newReleases),
    });
  } catch (err) {
    next(err);
  }
};

export default { readSections };
