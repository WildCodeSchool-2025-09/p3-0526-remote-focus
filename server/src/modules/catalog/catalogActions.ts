import type { RequestHandler } from "express";

import type { EnrichedMedia, Media } from "../../types/Media/Media.types";
import { buildPaginationMeta } from "../../utils/pagination";
import userRepository from "../user/userRepository";
import catalogRepository from "./catalogRepository";

const DEFAULT_PAGE_SIZE = 15;

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

const enrichRanking = (medias: Media[], offset = 0): EnrichedMedia[] => {
  return medias.map((media, index) => {
    const position = offset + index + 1;

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

const browse: RequestHandler = async (req, res, next) => {
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

    const genreParam = req.query.genre;
    const genreIds =
      typeof genreParam === "string" && genreParam.length > 0
        ? genreParam
            .split(",")
            .map(Number)
            .filter((id) => Number.isInteger(id) && id > 0)
        : [];

    const requestedPage = Number(req.query.page);
    const page = requestedPage > 0 ? requestedPage : 1;

    const requestedLimit = Number(req.query.limit);
    const limit = requestedLimit > 0 ? requestedLimit : DEFAULT_PAGE_SIZE;

    const offset = (page - 1) * limit;

    const [medias, total] = await Promise.all([
      catalogRepository.readByFilters(type, genreIds, offset, limit),
      catalogRepository.countByFilters(type, genreIds),
    ]);

    res.json({
      data: enrichRanking(medias, offset),
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (err) {
    next(err);
  }
};

export default { readDiscoverSections, browse };
