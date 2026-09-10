import type { SearchResults } from "../types/Media";

const API_URL = import.meta.env.VITE_API_URL;

const searchMedias = async (query: string): Promise<SearchResults> => {
  const response = await fetch(
    `${API_URL}/api/medias/search?q=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error("la recherche a échoué");
  }

  return response.json();
};

export { searchMedias };
