import type { RequestHandler } from "express";

import homepageRepository from "./homepageRepository";

import type { EnrichedMedia, Media } from "../../types/Media/Media.types";

const NEW_RELEASE_WINDOW_DAYS = 30;
const isMediaNew = (releasedAt: Date | string | null): boolean => {
  if (releasedAt == null) {
    return false;
  }

  const today = new Date();

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - NEW_RELEASE_WINDOW_DAYS);

  const released = new Date(releasedAt);

  return released >= windowStart && released <= today;
};

// ajoute les infos d'affichage (badges) à chaque média d'UN carrousel.
// la liste reçue est déjà triée par note décroissante => index = rang.
// (équivalent de `enrichRanking` de US-CAT-01)
const enrichMedias = (medias: Media[]): EnrichedMedia[] =>
  medias.map((media, index) => {
    const position = index + 1;

    let topRank: "top3" | "top10" | null = null;

    if (position <= 3) {
      topRank = "top3";
    } else if (position <= 10) {
      topRank = "top10";
    }

    return { ...media, topRank, isNew: isMediaNew(media.released_at) };
  });

// "browse" = liste complète, côté Actions (convention §2)
const browseByCategory: RequestHandler = async (_req, res, next) => {
  try {
    const [films, series, animes] = await Promise.all([
      homepageRepository.readByCategory("movie"),
      homepageRepository.readByCategory("tv"),
      homepageRepository.readByCategory("anime"),
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
