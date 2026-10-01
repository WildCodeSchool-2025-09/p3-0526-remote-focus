import type { RowDataPacket } from "mysql2";

export type UserRole = "user" | "admin";

export interface RegisterUserInput {
  firstName: string;
  lastName: string | null;
  email: string;
  bornAt: string;
  login: string;
  hashedPassword: string;
}

export interface UserAuthRow extends RowDataPacket {
  ID: number;
  firstname: string;
  lastname: string | null;
  email: string;
  login: string;
  avatar: string | null;
  role: UserRole;
  hashed_password: string;
}
