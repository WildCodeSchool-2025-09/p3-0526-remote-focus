import type { LoginPayload, LoginResponse } from "../types/Auth";

export interface RegisterPayload {
  firstName: string;
  lastName: string | null;
  email: string;
  bornAt: string;
  login: string;
  password: string;
  genreIds: number[];
}

interface RegisterResponse {
  insertId: number;
}

interface ApiErrorResponse {
  error?: string;
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ApiErrorResponse;

    throw new Error(errorData.error ?? "La création du compte a échoué.");
  }

  return (await response.json()) as RegisterResponse;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Impossible de joindre le serveur. Réessayez plus tard.");
  }

  if (response.status === 401) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  if (!response.ok) {
    throw new Error("La connexion a échoué. Réessayez plus tard.");
  }

  return (await response.json()) as LoginResponse;
}
