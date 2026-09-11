import jwt from "jsonwebtoken";

type TokenPayload = {
  id: number;
  login: string;
  role: "user" | "admin";
};

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.APP_SECRET as string, {
    expiresIn: "7d",
  });
}

export type { TokenPayload };
