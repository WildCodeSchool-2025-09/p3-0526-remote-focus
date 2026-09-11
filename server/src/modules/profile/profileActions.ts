import type { RequestHandler } from "express";
import authRepository from "../auth/authRepository";
import personRepository from "../person/personRepository";
import trackRepository from "../track/trackRepository";
import profileRepository from "./profileRepository";

const readDashboard: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const user = await authRepository.read(userId);

    if (user == null) {
      res.sendStatus(404);
      return;
    }

    const [favorites, watchlist, favoriteActors, watchedTitles] =
      await Promise.all([
        trackRepository.countFavorites(userId, null),
        trackRepository.countWatchlist(userId, null, null),
        personRepository.countFavorites(userId),
        profileRepository.countWatchedTitles(userId),
      ]);

    res.json({
      user: {
        firstname: user.firstname,
        login: user.login,
        avatar: user.avatar,
      },
      counts: {
        favorites,
        watchlist,
        favoriteActors,
        watchedTitles,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default { readDashboard };
