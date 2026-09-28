import argon2 from "argon2";
import type { RequestHandler } from "express";
import { generateToken } from "../../utils/generateToken";
import userRepository from "../user/userRepository";

const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      res.sendStatus(400);
      return;
    }

    const user = await userRepository.readByEmail(email);

    if (user == null) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    const isPasswordValid = await argon2.verify(user.hashed_password, password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    const token = generateToken({
      id: user.ID,
      login: user.login,
      role: user.role,
    });

    res.status(200).json({
      user: {
        id: user.ID,
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        login: user.login,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export default { login };
