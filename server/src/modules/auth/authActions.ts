import bcrypt from "bcryptjs";
import type { RequestHandler } from "express";
import { z } from "zod";
import type { Rows } from "../../../database/client";
import { generateToken } from "../../utils/generateToken";
import authRepository from "./authRepository";

const SALT_ROUNDS = 10;

const registerSchema = z
  .object({
    firstname: z.string().trim().min(1, "Le prénom est requis"),
    login: z.string().trim().min(3, "3 caractères minimum").max(50),
    email: z.string().trim().email("Email invalide"),
    bornAt: z.string().date("Date de naissance invalide"),
    password: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[A-Za-z]/, "Doit contenir au moins une lettre")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export function toPublicUser(user: Rows[number]) {
  return {
    id: user.ID,
    firstname: user.firstname,
    email: user.email,
    login: user.login,
    role: user.role,
    avatar: user.avatar,
    isPegi16: Boolean(user.is_pegi16),
    darkTheme: Boolean(user.dark_theme),
  };
}

const register: RequestHandler = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { firstname, login, email, bornAt, password } = parsed.data;

    const [existingEmail, existingLogin] = await Promise.all([
      authRepository.findByEmail(email),
      authRepository.findByLogin(login),
    ]);

    if (existingEmail != null) {
      res.status(409).json({ error: "email déjà utilisé" });
      return;
    }

    if (existingLogin != null) {
      res.status(409).json({ error: "pseudo déjà utilisé" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const userId = await authRepository.create({
      firstname,
      email,
      bornAt,
      login,
      password: hashedPassword,
      isPegi16: false,
    });

    const user = await authRepository.read(userId);

    if (user == null) {
      res.sendStatus(500);
      return;
    }

    const token = generateToken({
      id: user.ID,
      login: user.login,
      role: user.role,
    });

    res.status(201).json({ user: toPublicUser(user), token });
  } catch (err) {
    next(err);
  }
};

const login: RequestHandler = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { email, password } = parsed.data;

    const user = await authRepository.findByEmail(email);

    if (user == null) {
      res.status(401).json({ error: "Email ou mot de passe incorrect" });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      res.status(401).json({ error: "Email ou mot de passe incorrect" });
      return;
    }

    const token = generateToken({
      id: user.ID,
      login: user.login,
      role: user.role,
    });

    res.status(200).json({ user: toPublicUser(user), token });
  } catch (err) {
    next(err);
  }
};

export default { register, login };
