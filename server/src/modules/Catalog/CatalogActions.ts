import type { RequestHandler } from "express";

import CatalogRepository from "./CatalogRepository";
import UserRepository from "../User/UserRepository";
import type { Media, EnrichedMedia } from "../../types/Media/Media.types";

const enrichRanking = (medias: Media[]): EnrichedMedia[] => {
  return medias.map((media, index) => {
    const position = index + 1;

    let topRank: "top3" | "top10" | null = null;

    if (position <= 3) {
      topRank = "top3";
    } else if (position <= 10) {
      topRank = "top10";
    }

    const today = new Date();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const releasedAt = media.released_at ? new Date(media.released_at) : null;

    const isNew =
      releasedAt !== null && releasedAt >= thirtyDaysAgo && releasedAt <= today;

    return { ...media, topRank, isNew };
  });
};

const readDiscoverSections: RequestHandler = async (req, res, next) => {
  try {
    const type = typeof req.query.type === "string" ? req.query.type : null;
    const userId = req.user?.id;

    const topRated = await CatalogRepository.readTopRated(type);

    const newReleases = await CatalogRepository.readLatest30Days(type);

    const likedGenres = await UserRepository.readRandomGenres(userId);

    const topGenres = await Promise.all(
      likedGenres.map((likedGenre) =>
        CatalogRepository.readTopByGenre(likedGenre.ID_genre, type),
      ),
    );

    const enrichedTopRated = enrichRanking(topRated);

    const genreSections = likedGenres.map((likedGenre, index) => {
      const medias = topGenres[index].map((media) => {
        const rankedMedia = enrichedTopRated.find(
          (rankedMedia) => rankedMedia.ID === media.ID,
        );

        return {
          ...media,
          topRank: rankedMedia ? rankedMedia.topRank : null,
          isNew: rankedMedia ? rankedMedia.isNew : false,
        };
      });

      return {
        genre: likedGenre.ID_genre,
        medias,
      };
    });

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
