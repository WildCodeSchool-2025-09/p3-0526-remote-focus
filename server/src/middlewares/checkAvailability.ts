import type { RequestHandler } from "express";

import userRepository from "../modules/user/userRepository";

const checkAvailability: RequestHandler = async (req, res, next) => {
  try {
    const { email, login } = req.body;

    const emailAlreadyExists = await userRepository.emailExists(email);

    if (emailAlreadyExists) {
      res.status(409).json({
        error: "Cette adresse e-mail est déjà utilisée.",
      });
      return;
    }

    const loginAlreadyExists = await userRepository.loginExists(login);

    if (loginAlreadyExists) {
      res.status(409).json({
        error: "Ce pseudo est déjà utilisé.",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default checkAvailability;
