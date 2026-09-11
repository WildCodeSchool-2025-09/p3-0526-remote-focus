import type { RequestHandler } from "express";
import { buildPaginationMeta } from "../../utils/pagination";
import trackRepository from "./trackRepository";

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

const toggleFavorite: RequestHandler = async (req, res, next) => {
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

    const isFavorite = await trackRepository.toggleFavorite(userId, mediaId);

    res.json({ isFavorite });
  } catch (err) {
    next(err);
  }
};

const toggleWatchlist: RequestHandler = async (req, res, next) => {
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

    const isInWatchlist = await trackRepository.toggleWatchlist(
      userId,
      mediaId,
    );

    res.json({ isInWatchlist });
  } catch (err) {
    next(err);
  }
};

const browseFavorites: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const type = parseTypeFilter(req.query.type);
    const { page, limit, offset } = parsePagination(req.query);

    const [data, total] = await Promise.all([
      trackRepository.browseFavorites(userId, type, offset, limit),
      trackRepository.countFavorites(userId, type),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

function parseWatchedFilter(value: unknown): "watched" | "to-watch" | null {
  return value === "watched" || value === "to-watch" ? value : null;
}

const browseWatchlist: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const type = parseTypeFilter(req.query.type);
    const watchedFilter = parseWatchedFilter(req.query.watched);
    const { page, limit, offset } = parsePagination(req.query);

    const [data, total] = await Promise.all([
      trackRepository.browseWatchlist(
        userId,
        type,
        watchedFilter,
        offset,
        limit,
      ),
      trackRepository.countWatchlist(userId, type, watchedFilter),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

export default {
  toggleFavorite,
  toggleWatchlist,
  browseFavorites,
  browseWatchlist,
};
