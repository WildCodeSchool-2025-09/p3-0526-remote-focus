import type { RequestHandler } from "express";
import trackRepository from "./trackRepository";

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

export default { toggleFavorite, toggleWatchlist };
