import type { RequestHandler } from "express";
import actorRepository from "./actorRepository";

const readFilmography: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const exclude = Number(req.query.exclude);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const medias = await actorRepository.readFilmography(
      id,
      Number.isNaN(exclude) ? 0 : exclude,
    );

    res.json(
      medias.map((item) => ({
        id: item.ID,
        name: item.name,
        poster: item.poster,
        type: item.type,
        releasedAt: item.released_at,
        characterName: item.personnage_name,
      })),
    );
  } catch (err) {
    next(err);
  }
};

const readKnownFor: RequestHandler = async (req, res, next) => {
  try {
    const personId = Number(req.params.id);
    const userId = req.user?.id;
    const exclude = Number(req.query.exclude);
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = 10;

    if (!Number.isInteger(page) || page < 1) {
      res.sendStatus(400);
      return;
    }

    const offset = (page - 1) * limit;

    if (Number.isNaN(personId)) {
      res.sendStatus(400);
      return;
    }

    const medias = userId
      ? await actorRepository.readSeenWithActor(
          personId,
          userId,
          Number.isNaN(exclude) ? 0 : exclude,
          limit,
          offset,
        )
      : await actorRepository.readTopRatedByActor(
          personId,
          Number.isNaN(exclude) ? 0 : exclude,
        );

    const total = userId
      ? await actorRepository.countSeenMediaByActor(
          personId,
          userId,
          Number.isNaN(exclude) ? 0 : exclude,
        )
      : null;

    const totalPages = total !== null ? Math.ceil(total / limit) : null;

    res.json({
      mode: userId ? "seen" : "top-rated",
      medias: medias.map((media) => ({
        id: media.ID,
        name: media.name,
        poster: media.poster,
        type: media.type,
        releasedAt: media.released_at,
        characterNames: media.characterNames?.split(", ").filter(Boolean) ?? [],
      })),
      pagination: userId ? { total, page, limit, totalPages } : null,
    });
  } catch (err) {
    next(err);
  }
};

export default { readFilmography, readKnownFor };
