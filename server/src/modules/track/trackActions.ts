import type { RequestHandler } from "express";
import { formatMedias } from "../../utils/formatters";
import trackRepository from "./trackRepository";

const LIMIT = 10;

function isMediaType(value: unknown): value is "movie" | "tv" | "anime" {
  return value === "movie" || value === "tv" || value === "anime";
}

const browseWatchlist: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const {
      type: requestedType,
      seen: requestedSeen,
      page: requestedPage,
    } = req.query;

    if (requestedType !== undefined && !isMediaType(requestedType)) {
      res.status(400).json({ error: "Invalid media type" });
      return;
    }

    if (
      requestedSeen !== undefined &&
      requestedSeen !== "true" &&
      requestedSeen !== "false"
    ) {
      res.status(400).json({ error: "Invalid seen filter" });
      return;
    }

    const page = requestedPage === undefined ? 1 : Number(requestedPage);

    if (!Number.isInteger(page) || page < 1) {
      res.status(400).json({ error: "Invalid page number" });
      return;
    }

    const type = isMediaType(requestedType) ? requestedType : null;
    const seen = requestedSeen === undefined ? null : requestedSeen === "true";
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
