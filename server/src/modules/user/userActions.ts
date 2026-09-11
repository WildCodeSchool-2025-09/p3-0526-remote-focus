import type { RequestHandler } from "express";
import { z } from "zod";
import genreRepository from "../genre/genreRepository";
import userRepository from "./userRepository";

const preferencesSchema = z.object({
  genreIds: z.array(z.number().int().positive()),
});

const savePreferences: RequestHandler = async (req, res, next) => {
  try {
    const parsed = preferencesSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const { genreIds } = parsed.data;

    const existingGenres = await genreRepository.findByIds(genreIds);

    if (existingGenres.length !== genreIds.length) {
      res.status(400).json({ error: "genre invalide" });
      return;
    }

    await userRepository.addGenrePreferences(userId, genreIds);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default { savePreferences };
