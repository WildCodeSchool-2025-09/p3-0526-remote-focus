import type {
  CatalogResponse,
  DiscoverResponse,
  Format,
} from "../types/Catalog";

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

export function fetchCatalog(
  format: Format,
  genreIds: number[],
  page: number,
  limit = 15,
): Promise<CatalogResponse> {
  const params = new URLSearchParams();

  if (format != null) {
    params.set("type", format);
  }

  if (genreIds.length > 0) {
    params.set("genre", genreIds.join(","));
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  return fetch(
    `${import.meta.env.VITE_API_URL}/api/medias?${params.toString()}`,
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    return response.json();
  });
}

export default fetchDiscover;
