import argon2 from "argon2";
import type { RequestHandler } from "express";

const hashPassword: RequestHandler = async (req, _res, next) => {
  try {
    const { password, ...bodyWithoutPassword } = req.body;

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    req.body = {
      ...bodyWithoutPassword,
      hashedPassword,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default hashPassword;
