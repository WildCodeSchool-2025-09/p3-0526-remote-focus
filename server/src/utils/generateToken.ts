import jwt from "jsonwebtoken";

type TokenPayload = {
  id: number;
  login: string;
  role: string;
};

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET;

  if (secret == null) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, secret, { expiresIn: "7d" });
}