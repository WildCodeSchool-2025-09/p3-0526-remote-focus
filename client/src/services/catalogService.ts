import type { DiscoverResponse } from "../types/Catalog";
import type { Genre } from "../types/media";

function fetchDiscover(
  type?: "movie" | "tv" | "anime",
): Promise<DiscoverResponse> {
  const urlRequestedType = type
    ? `${import.meta.env.VITE_API_URL}/api/medias/discover?type=${type}`
    : `${import.meta.env.VITE_API_URL}/api/medias/discover`;

  return fetch(urlRequestedType).then((response) => {
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    return response.json();
  });
}

async function fetchGenres(): Promise<Genre[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/genres`);

  if (!response.ok) {
    throw new Error(`${response.status}`);
  }

  const data = await response.json();

  return data.genreList;
}

export { fetchDiscover, fetchGenres };
