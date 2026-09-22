import type { SearchResults } from "../types/search";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

const searchMedias = async (
  query: string,
  page = 1,
  type?: string,
): Promise<SearchResults> => {
  const params = new URLSearchParams({ q: query, page: String(page) });

  if (type) {
    params.set("type", type);
  }

  const response = await fetch(`${API_URL}/api/medias/search?${params}`);

  if (!response.ok) {
    throw new Error("la recherche a échoué");
  }

  return response.json();
};

export { searchMedias };
