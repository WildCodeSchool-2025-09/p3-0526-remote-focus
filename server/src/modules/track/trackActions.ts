import type { RequestHandler } from "express";
import { formatMedias } from "../../utils/formatters";
import trackRepository, { type WatchlistType } from "./trackRepository";

const VALID_TYPES = ["movie", "tv", "anime"];
const LIMIT = 10;

function parseType(value: unknown): WatchlistType {
  return typeof value === "string" && VALID_TYPES.includes(value)
    ? (value as WatchlistType)
    : null;
}

function parseSeen(value: unknown): boolean | null {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return null;
}

const browseWatchlist: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const type = parseType(req.query.type);
    const seen = parseSeen(req.query.seen);
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * LIMIT;

    const [rows, total] = await Promise.all([
      trackRepository.browseWatchlist(userId, type, seen, LIMIT, offset),
      trackRepository.countWatchlistByFilters(userId, type, seen),
    ]);

    res.json({
      medias: formatMedias(rows),
      hasMore: offset + rows.length < total,
    });
  } catch (error) {
    next(error);
  }
};

export default { browseWatchlist };
