import { getAuthHeaders } from "../utils/authStorage";
import { API_URL } from "./api";
import { UnauthorizedError } from "./errors";

async function patchAccount<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "La modification a échoué.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function updateLogin(login: string): Promise<{ login: string }> {
  return patchAccount("/api/me/login", { login });
}

export async function updateEmail(email: string): Promise<{ email: string }> {
  return patchAccount("/api/me/email", { email });
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  return patchAccount("/api/me/password", { currentPassword, newPassword });
}
