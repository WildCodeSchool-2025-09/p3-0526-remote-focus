import type { RequestHandler } from "express";
import actorRepository from "./actorRepository";

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const person = await actorRepository.read(id);

    if (person == null) {
      res.sendStatus(404);
      return;
    }

    res.json({
      id: person.ID,
      name: person.name,
      photo: person.photo,
      biography: person.biography,
    });
  } catch (err) {
    next(err);
  }
};

const FILMOGRAPHY_PAGE_SIZE = 6;

const browseFilmography: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const exclude = Number(req.query.exclude);
    const requestedPage = Math.floor(Number(req.query.page));

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const excludeMediaId = Number.isNaN(exclude) ? 0 : exclude;
    const page = requestedPage >= 1 ? requestedPage : 1;
    const offset = (page - 1) * FILMOGRAPHY_PAGE_SIZE;

    const [items, total] = await Promise.all([
      actorRepository.readFilmography(
        id,
        excludeMediaId,
        FILMOGRAPHY_PAGE_SIZE,
        offset,
      ),
      actorRepository.countFilmography(id, excludeMediaId),
    ]);

    res.json({
      items,
      hasMore: offset + items.length < total,
    });
  } catch (err) {
    next(err);
  }
};

export default { read, browseFilmography };
