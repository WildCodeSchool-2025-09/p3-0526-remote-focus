export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  bornAt: string;
  login: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  bornAt?: string;
  login?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  genres?: string;
  form?: string;
}

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  login: string;
  avatar: string | null;
  role: "user" | "admin";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  form?: string;
}
