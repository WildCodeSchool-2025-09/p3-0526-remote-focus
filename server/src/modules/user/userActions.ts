import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import type { RequestHandler } from "express";
import sharp from "sharp";
import { z } from "zod";
import { toPublicUser } from "../auth/authActions";
import authRepository from "../auth/authRepository";
import genreRepository from "../genre/genreRepository";
import userRepository from "./userRepository";

const SALT_ROUNDS = 10;
const AVATAR_MAX_DIMENSION = 1024;
const AVATAR_DIR = path.join(__dirname, "../../../public/uploads/avatars");
const AVATAR_URL_PREFIX = "/uploads/avatars/";

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

const loginSchema = z.object({
  login: z.string().trim().min(3, "3 caractères minimum").max(50),
});

const updateLogin: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { login } = parsed.data;

    const existing = await authRepository.findByLogin(login);

    if (existing != null && existing.ID !== userId) {
      res.status(409).json({ error: "pseudo déjà utilisé" });
      return;
    }

    await userRepository.updateLogin(userId, login);

    const user = await authRepository.read(userId);

    if (user == null) {
      res.sendStatus(404);
      return;
    }

    res.json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
};

const emailSchema = z.object({
  email: z.string().trim().email("Email invalide"),
});

const updateEmail: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const parsed = emailSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { email } = parsed.data;

    const existing = await authRepository.findByEmail(email);

    if (existing != null && existing.ID !== userId) {
      res.status(409).json({ error: "email déjà utilisé" });
      return;
    }

    await userRepository.updateEmail(userId, email);

    const user = await authRepository.read(userId);

    if (user == null) {
      res.sendStatus(404);
      return;
    }

    res.json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
};

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[A-Za-z]/, "Doit contenir au moins une lettre")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  });

const updatePassword: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const parsed = passwordSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { currentPassword, newPassword } = parsed.data;

    const currentHash = await userRepository.readPasswordHash(userId);

    if (currentHash == null) {
      res.sendStatus(404);
      return;
    }

    const passwordMatches = await bcrypt.compare(currentPassword, currentHash);

    if (!passwordMatches) {
      res.status(401).json({ error: "mot de passe actuel incorrect" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await userRepository.updatePassword(userId, hashedPassword);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const uploadAvatar: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    if (req.file == null) {
      res.status(400).json({ error: "aucun fichier reçu" });
      return;
    }

    const previousUser = await authRepository.read(userId);

    await fs.mkdir(AVATAR_DIR, { recursive: true });

    const filename = `${userId}-${crypto.randomUUID()}.webp`;

    await sharp(req.file.buffer)
      .resize(AVATAR_MAX_DIMENSION, AVATAR_MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp()
      .toFile(path.join(AVATAR_DIR, filename));

    await userRepository.updateAvatar(
      userId,
      `${AVATAR_URL_PREFIX}${filename}`,
    );

    if (
      previousUser != null &&
      typeof previousUser.avatar === "string" &&
      previousUser.avatar.startsWith(AVATAR_URL_PREFIX)
    ) {
      const previousPath = path.join(
        AVATAR_DIR,
        path.basename(previousUser.avatar),
      );
      await fs.unlink(previousPath).catch(() => {});
    }

    const user = await authRepository.read(userId);

    if (user == null) {
      res.sendStatus(404);
      return;
    }

    res.json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
};

export default {
  savePreferences,
  updateLogin,
  updateEmail,
  updatePassword,
  uploadAvatar,
};
