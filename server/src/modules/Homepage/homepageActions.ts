import type { RequestHandler } from "express";
import type { EnrichedMedia, Media } from "../../types/Media/Media.types";

import HomepageRepository from "./homepageRepository";

const isMediaNew = (releasedAt: Date | string | null): boolean => {
  if (releasedAt == null) {
    return false;
  }
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const releasedAtDate = new Date(releasedAt);

  return releasedAtDate >= thirtyDaysAgo && releasedAtDate <= today;
};

const enrichMedias = (medias: Media[]): EnrichedMedia[] => {
  return medias.map((media, index) => {
    const position = index + 1;

    return {
      ...media,
      topRank: position <= 3 ? "top3" : position <= 10 ? "top10" : null,
      isNew: isMediaNew(media.released_at),
    };
  });
};

const browseByCategory: RequestHandler = async (_req, res, next) => {
  try {
    const [films, series, animes] = await Promise.all([
      HomepageRepository.readByCategory("movie"),
      HomepageRepository.readByCategory("tv"),
      HomepageRepository.readByCategory("anime"),
    ]);

    res.json({
      films: enrichMedias(films),
      series: enrichMedias(series),
      animes: enrichMedias(animes),
    });
  } catch (err) {
    next(err);
  }
};

export default { browseByCategory };
