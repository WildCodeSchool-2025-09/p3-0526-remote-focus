import type { DiscoverResponse } from "../types/Catalog";

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

export default fetchDiscover;
