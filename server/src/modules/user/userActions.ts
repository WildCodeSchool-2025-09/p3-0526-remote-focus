import type { RequestHandler } from "express";

import type { RegisterUserInput } from "../../types/User/User.types";
import UserRepository from "./userRepository";

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

    const insertId = await UserRepository.create(newUser);

    await UserRepository.addLikedGenres(insertId, req.body.genreIds);

    res.status(201).json({
      insertId,
    });
  } catch (error) {
    next(error);
  }
};

export default { add };
