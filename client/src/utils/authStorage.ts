export const TOKEN_STORAGE_KEY = "focus.token";
export const USER_STORAGE_KEY = "focus.user";

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token === null) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}

export function getTokenExpiration(token: string): number | null {
  const payload = token.split(".")[1];

  if (payload === undefined) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64)) as { exp?: unknown };

    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}
