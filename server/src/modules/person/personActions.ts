import type { RequestHandler } from "express";
import type { Rows } from "../../../database/client";
import { buildPaginationMeta } from "../../utils/pagination";
import personRepository from "./personRepository";

const KNOWN_FOR_LIMIT = 5;
const SEEN_PAGE_SIZE = 10;
const FAVORITE_ACTORS_PAGE_SIZE = 6;
const MOST_VIEWED_ACTORS_LIMIT = 12;

function mapMedia(row: Rows[number]) {
  return {
    id: row.ID,
    name: row.name,
    poster: row.poster,
    type: row.type,
    releasedAt: row.released_at,
    overallRating: row.overall_rating,
  };
}

const readKnownFor: RequestHandler = async (req, res, next) => {
  try {
    const personId = Number(req.params.id);

    if (Number.isNaN(personId)) {
      res.sendStatus(400);
      return;
    }

    const excludeParam = Number(req.query.excludeMediaId);
    const excludeMediaId = Number.isNaN(excludeParam) ? 0 : excludeParam;

    const userId = req.user?.id;

    if (userId == null) {
      const data = await personRepository.readTopRatedByActor(
        personId,
        excludeMediaId,
        KNOWN_FOR_LIMIT,
      );

      res.json({
        mode: "top-rated",
        data: data.map(mapMedia),
      });
      return;
    }

    const requestedPage = Number(req.query.page);
    const page = requestedPage > 0 ? requestedPage : 1;
    const offset = (page - 1) * SEEN_PAGE_SIZE;

    const [seen, total] = await Promise.all([
      personRepository.readSeenMediaByActor(
        userId,
        personId,
        excludeMediaId,
        offset,
        SEEN_PAGE_SIZE,
      ),
      personRepository.countSeenMediaByActor(userId, personId, excludeMediaId),
    ]);

    res.json({
      mode: "seen",
      data: seen.map(mapMedia),
      pagination: {
        page,
        limit: SEEN_PAGE_SIZE,
        total,
        hasMore: offset + seen.length < total,
      },
    });
  } catch (err) {
    next(err);
  }
};

const toggleFavorite: RequestHandler = async (req, res, next) => {
  try {
    const personId = Number(req.params.id);

    if (Number.isNaN(personId)) {
      res.sendStatus(400);
      return;
    }

    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    if (!(await personRepository.personExists(personId))) {
      res.sendStatus(404);
      return;
    }

    const isFavorite = await personRepository.toggleFavorite(userId, personId);

    res.json({ isFavorite });
  } catch (err) {
    next(err);
  }
};

const readMyActors: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const requestedPage = Number(req.query.page);
    const page = requestedPage > 0 ? requestedPage : 1;

    const requestedLimit = Number(req.query.limit);
    const limit =
      requestedLimit > 0 ? requestedLimit : FAVORITE_ACTORS_PAGE_SIZE;

    const offset = (page - 1) * limit;

    const [allFavorites, mostViewed] = await Promise.all([
      personRepository.readAllFavorites(userId),
      personRepository.readMostViewedActors(userId, MOST_VIEWED_ACTORS_LIMIT),
    ]);

    const favoritesWithSeenCount = await Promise.all(
      allFavorites.map(async (actor) => ({
        ...actor,
        seenCount: await personRepository.countSeenMediaByActor(
          userId,
          actor.id,
          0,
        ),
      })),
    );

    // tri fixe par nombre de titres vus décroissant (US-PRO-04)
    favoritesWithSeenCount.sort((a, b) => b.seenCount - a.seenCount);

    const total = favoritesWithSeenCount.length;
    const pageItems = favoritesWithSeenCount.slice(offset, offset + limit);

    res.json({
      favorites: {
        data: pageItems,
        pagination: buildPaginationMeta(page, limit, total),
      },
      mostViewed,
    });
  } catch (err) {
    next(err);
  }
};

export default { readKnownFor, toggleFavorite, readMyActors };
