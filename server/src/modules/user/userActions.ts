import type { RequestHandler } from "express";

import type { RegisterUserInput } from "../../types/User/User.types";
import favoriteRepository from "../favorite/favoriteRepository";
import trackRepository from "../track/trackRepository";
import userRepository from "./userRepository";

const add: RequestHandler = async (req, res, next) => {
  try {
    const newUser: RegisterUserInput = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      bornAt: req.body.bornAt,
      login: req.body.login,
      hashedPassword: req.body.hashedPassword,
    };

    const insertId = await userRepository.create(newUser);

    await userRepository.addLikedGenres(insertId, req.body.genreIds);

    res.status(201).json({
      insertId,
    });
  } catch (error) {
    next(error);
  }
};

const readDashboard: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const profile = await userRepository.readProfile(userId);

    if (profile == null) {
      res.sendStatus(404);
      return;
    }

    const [favorites, watchlist, actors] = await Promise.all([
      trackRepository.countFavoriteMedias(userId),
      trackRepository.countWatchlist(userId),
      favoriteRepository.countFavoriteActors(userId),
    ]);

    res.json({
      profile: {
        name: profile.firstname,
        avatar: profile.avatar,
        createdAt: profile.created_at,
      },
      counts: { favorites, watchlist, actors },
    });
  } catch (error) {
    next(error);
  }
};

export default { add, readDashboard };
