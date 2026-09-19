import type { RequestHandler } from "express";
import mediaRepository from "../media/mediaRepository";

const readEpisodes: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const episodes = await mediaRepository.readEpisodes(id);

    res.json(
      episodes.map((episode) => ({
        id: episode.ID,
        name: episode.name,
        number: episode.number,
        releasedAt: episode.released_at,
        synopsis: episode.synopsis,
        duration: episode.duration,
      })),
    );
  } catch (err) {
    next(err);
  }
};

export default { readEpisodes };
