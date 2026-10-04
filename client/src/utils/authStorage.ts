export const TOKEN_STORAGE_KEY = "focus.token";
export const USER_STORAGE_KEY = "focus.user";

// Le localStorage peut être bloqué (navigation privée stricte, données de
// site désactivées) : ces fonctions évitent qu'une exception fasse planter
// l'application.
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Stockage indisponible : la session reste seulement en mémoire.
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Stockage indisponible : il n'y a rien à supprimer.
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = safeGetItem(TOKEN_STORAGE_KEY);

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
