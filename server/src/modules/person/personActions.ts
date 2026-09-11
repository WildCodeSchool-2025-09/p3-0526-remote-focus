import type { RequestHandler } from "express";
import type { Rows } from "../../../database/client";
import personRepository from "./personRepository";

const KNOWN_FOR_LIMIT = 5;
const SEEN_PAGE_SIZE = 10;

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

export default { readKnownFor };
