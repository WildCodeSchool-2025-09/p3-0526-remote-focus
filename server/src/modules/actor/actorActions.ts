import type { RequestHandler } from "express";
import actorRepository from "./actorRepository";

const KNOWN_FROM_LIMIT = 6;

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const actor = await actorRepository.read(id);

    if (actor == null) {
      res.sendStatus(404);
      return;
    }

    res.json({
      id: actor.ID,
      name: actor.name,
      photo: actor.photo,
      biography: actor.biography,
    });
  } catch (err) {
    next(err);
  }
};

const readFilmography: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const excludeParam = Number(req.query.exclude);
    const excludeMediaId = Number.isNaN(excludeParam)
      ? undefined
      : excludeParam;

    const sortOrder = req.query.sortBy === "date-asc" ? "asc" : "desc";

    // La limite de 6 ne s'applique qu'au widget "Vous le connaissez déjà dans"
    // (toujours appelé avec exclude) ; la page filmographie complète (US-DET-06)
    // n'a pas de limite.
    const limit = excludeMediaId != null ? KNOWN_FROM_LIMIT : undefined;

    const medias = await actorRepository.readFilmography(id, {
      excludeMediaId,
      sortOrder,
      limit,
    });

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

export default { read, readFilmography };
