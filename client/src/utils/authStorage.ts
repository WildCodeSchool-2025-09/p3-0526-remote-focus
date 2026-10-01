export const TOKEN_STORAGE_KEY = "focus.token";
export const USER_STORAGE_KEY = "focus.user";

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token === null) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}
