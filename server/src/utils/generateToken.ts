import jwt from "jsonwebtoken";

import type { UserRole } from "../types/User/User.types";

type TokenPayload = {
  id: number;
  login: string;
  role: UserRole;
};

// Durée de vie courte : un token volé devient inutilisable plus vite.
const TOKEN_LIFETIME = "24h";

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, secret, { expiresIn: TOKEN_LIFETIME });
}
