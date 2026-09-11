import type { RequestHandler } from "express";
import { resolveHidePegi16 } from "../../utils/applyPegiFilter";
import { buildPaginationMeta } from "../../utils/pagination";
import trackRepository from "../track/trackRepository";
import trackingRepository from "./trackingRepository";

const DEFAULT_PAGE_SIZE = 10;

function parseTypeFilter(value: unknown): "movie" | "tv" | "anime" | null {
  return value === "movie" || value === "tv" || value === "anime"
    ? value
    : null;
}

function parsePagination(query: {
  page?: unknown;
  limit?: unknown;
}): { page: number; limit: number; offset: number } {
  const requestedPage = Number(query.page);
  const page = requestedPage > 0 ? requestedPage : 1;

  const requestedLimit = Number(query.limit);
  const limit = requestedLimit > 0 ? requestedLimit : DEFAULT_PAGE_SIZE;

  return { page, limit, offset: (page - 1) * limit };
}

const toggleMovieWatched: RequestHandler = async (req, res, next) => {
  try {
    const mediaId = Number(req.params.id);
    const userId = req.user?.id;

    if (Number.isNaN(mediaId)) {
      res.sendStatus(400);
      return;
    }
    if (userId == null) {
      res.sendStatus(401);
      return;
    }
    if (!(await trackRepository.mediaExists(mediaId))) {
      res.sendStatus(404);
      return;
    }

    const isWatched = await trackingRepository.isMovieWatched(userId, mediaId);

    if (isWatched) {
      await trackingRepository.unmarkMovieAsWatched(userId, mediaId);
    } else {
      await trackingRepository.markMovieAsWatched(userId, mediaId);
    }

    res.json({ isWatched: !isWatched });
  } catch (err) {
    next(err);
  }
};

const toggleSeriesWatched: RequestHandler = async (req, res, next) => {
  try {
    const mediaId = Number(req.params.id);
    const userId = req.user?.id;

    if (Number.isNaN(mediaId)) {
      res.sendStatus(400);
      return;
    }
    if (userId == null) {
      res.sendStatus(401);
      return;
    }
    if (!(await trackRepository.mediaExists(mediaId))) {
      res.sendStatus(404);
      return;
    }

    const isWatched = await trackingRepository.isSeriesFullyWatched(
      userId,
      mediaId,
    );

    if (isWatched) {
      await trackingRepository.unmarkSeriesAsWatched(userId, mediaId);
    } else {
      await trackingRepository.markSeriesAsWatched(userId, mediaId);
    }

    res.json({ isWatched: !isWatched });
  } catch (err) {
    next(err);
  }
};

const toggleSeasonWatched: RequestHandler = async (req, res, next) => {
  try {
    const seasonId = Number(req.params.id);
    const userId = req.user?.id;

    if (Number.isNaN(seasonId)) {
      res.sendStatus(400);
      return;
    }
    if (userId == null) {
      res.sendStatus(401);
      return;
    }
    if (!(await trackingRepository.seasonExists(seasonId))) {
      res.sendStatus(404);
      return;
    }

    const isWatched = await trackingRepository.isSeasonFullyWatched(
      userId,
      seasonId,
    );

    if (isWatched) {
      await trackingRepository.unmarkSeasonAsWatched(userId, seasonId);
    } else {
      await trackingRepository.markSeasonAsWatched(userId, seasonId);
    }

    res.json({ isWatched: !isWatched });
  } catch (err) {
    next(err);
  }
};

const toggleEpisodeWatched: RequestHandler = async (req, res, next) => {
  try {
    const episodeId = Number(req.params.id);
    const userId = req.user?.id;

    if (Number.isNaN(episodeId)) {
      res.sendStatus(400);
      return;
    }
    if (userId == null) {
      res.sendStatus(401);
      return;
    }
    if (!(await trackingRepository.episodeExists(episodeId))) {
      res.sendStatus(404);
      return;
    }

    const isWatched = await trackingRepository.isEpisodeWatched(
      userId,
      episodeId,
    );

    if (isWatched) {
      await trackingRepository.unmarkEpisodeAsWatched(userId, episodeId);
    } else {
      await trackingRepository.markEpisodeAsWatched(userId, episodeId);
    }

    res.json({ isWatched: !isWatched });
  } catch (err) {
    next(err);
  }
};

const browseInProgress: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const type = parseTypeFilter(req.query.type);
    const { page, limit, offset } = parsePagination(req.query);
    const hidePegi16 = await resolveHidePegi16(userId);

    const [data, total] = await Promise.all([
      trackingRepository.browseInProgress(
        userId,
        type,
        hidePegi16,
        offset,
        limit,
      ),
      trackingRepository.countInProgress(userId, type, hidePegi16),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

export default {
  toggleMovieWatched,
  toggleSeriesWatched,
  toggleSeasonWatched,
  toggleEpisodeWatched,
  browseInProgress,
};
