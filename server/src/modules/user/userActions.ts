import argon2 from "argon2";
import type { RequestHandler } from "express";

import type { RegisterUserInput } from "../../types/User/User.types";
import {
  validateEmailValue,
  validateLoginValue,
  validatePasswordValue,
} from "../../utils/accountValidators";
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
        name: profile.login,
        avatar: profile.avatar,
        createdAt: profile.created_at,
      },
      counts: { favorites, watchlist, actors },
    });
  } catch (error) {
    next(error);
  }
};

const readSettings: RequestHandler = async (req, res, next) => {
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

    res.json({
      profile: {
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
        bornAt: profile.born_at,
        name: profile.login,
        avatar: profile.avatar,
        createdAt: profile.created_at,
      },
      preferences: {
        darkTheme: profile.dark_theme,
        isPegi16: profile.is_pegi16,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateLogin: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const loginError = validateLoginValue(req.body.login);

    if (loginError != null) {
      res.status(400).json({ error: loginError });
      return;
    }

    const login = (req.body.login as string).trim();

    const loginTaken = await userRepository.findByLogin(login, userId);

    if (loginTaken) {
      res.status(409).json({ error: "Ce pseudo est déjà utilisé." });
      return;
    }

    await userRepository.updateLogin(userId, login);

    res.json({ login });
  } catch (error) {
    next(error);
  }
};

const updateEmail: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const emailError = validateEmailValue(req.body.email);

    if (emailError != null) {
      res.status(400).json({ error: emailError });
      return;
    }

    const email = (req.body.email as string).trim().toLowerCase();

    const emailTaken = await userRepository.findByEmail(email, userId);

    if (emailTaken) {
      res
        .status(409)
        .json({ error: "Cette adresse e-mail est déjà utilisée." });
      return;
    }

    await userRepository.updateEmail(userId, email);

    res.json({ email });
  } catch (error) {
    next(error);
  }
};

const updatePassword: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (typeof currentPassword !== "string" || currentPassword.length === 0) {
      res
        .status(400)
        .json({ error: "Le mot de passe actuel est obligatoire." });
      return;
    }

    const passwordError = validatePasswordValue(newPassword);

    if (passwordError != null) {
      res.status(400).json({ error: passwordError });
      return;
    }

    const hashedPassword = await userRepository.readHashedPasswordById(userId);

    if (hashedPassword == null) {
      res.sendStatus(404);
      return;
    }

    const isCurrentPasswordValid = await argon2.verify(
      hashedPassword,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      res.status(400).json({ error: "Le mot de passe actuel est incorrect." });
      return;
    }

    const newHashedPassword = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    await userRepository.updatePassword(userId, newHashedPassword);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default {
  add,
  readDashboard,
  readSettings,
  updateLogin,
  updateEmail,
  updatePassword,
};
