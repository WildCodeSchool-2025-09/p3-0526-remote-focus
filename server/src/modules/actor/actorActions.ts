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

export default { readFilmography };
