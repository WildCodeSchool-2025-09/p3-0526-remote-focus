import type { RequestHandler } from "express";
import type { EnrichedMedia, Media } from "../../types/Media/Media.types";

import { isMediaNew } from "../catalog/catalogHelpers";
import HomepageRepository from "./homepageRepository";

const enrichMedias = (medias: Media[]): EnrichedMedia[] => {
  return medias.map((media, index) => {
    const position = index + 1;

    return {
      ...media,
      topRank: position <= 3 ? "top3" : position <= 10 ? "top10" : null,
      isNew: isMediaNew(media.releasedAt),
    };
  });
};

const browseHomepage: RequestHandler = async (_req, res, next) => {
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

export default { browseHomepage };
