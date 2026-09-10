import type { RequestHandler } from "express";

import catalogRepository from "./catalogRepository";
import userRepository from "../user/userRepository";
import type { Media, EnrichedMedia } from "../../types/Media/Media.types";

const isMediaNew = (releasedAt: Date | string | null): boolean => {
  const today = new Date();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const releasedAtDate = releasedAt ? new Date(releasedAt) : null;

  return (
    releasedAtDate !== null &&
    releasedAtDate >= thirtyDaysAgo &&
    releasedAtDate <= today
  );
};

const enrichRanking = (medias: Media[]): EnrichedMedia[] => {
  return medias.map((media, index) => {
    const position = index + 1;

    let topRank: "top3" | "top10" | null = null;

    if (position <= 3) {
      topRank = "top3";
    } else if (position <= 10) {
      topRank = "top10";
    }

    const isNew = isMediaNew(media.releasedAt);

    return { ...media, topRank, isNew };
  });
};

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

    const newReleases = await catalogRepository.readLatest30Days(type);

    const likedGenres = await userRepository.readRandomGenres(userId);

    const topGenres = await Promise.all(
      likedGenres.map((likedGenre) =>
        catalogRepository.readTopByGenre(likedGenre.id, type),
      ),
    );

    const enrichedTopRated = enrichRanking(topRated);

    const genreSections = likedGenres.map((likedGenre, index) => {
      const medias = topGenres[index].map((media) => {
        const rankedMedia = enrichedTopRated.find(
          (rankedMedia) => rankedMedia.id === media.id,
        );

        return {
          ...media,
          topRank: rankedMedia ? rankedMedia.topRank : null,
          isNew: isMediaNew(media.releasedAt),
        };
      });

      return {
        id: likedGenre.id,
        name: likedGenre.name,
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
