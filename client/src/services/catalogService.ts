import type {
  CalendarFormat,
  CalendarGroup,
  CatalogResponse,
  DiscoverResponse,
  Format,
  HomepageResponse,
  SuggestionsResponse,
} from "../types/Catalog";

function authHeaders(token?: string): HeadersInit {
  return token != null ? { Authorization: `Bearer ${token}` } : {};
}

function fetchDiscover(
  type?: "movie" | "tv" | "anime",
  token?: string,
): Promise<DiscoverResponse> {
  const urlRequestedType = type
    ? `${import.meta.env.VITE_API_URL}/api/medias/discover?type=${type}`
    : `${import.meta.env.VITE_API_URL}/api/medias/discover`;

  return fetch(urlRequestedType, { headers: authHeaders(token) }).then(
    (response) => {
      if (!response.ok) {
        throw new Error(`${response.status}`);
      }
      return response.json();
    },
  );
}

export function fetchCatalog(
  format: Format,
  genreIds: number[],
  page: number,
  limit = 15,
  token?: string,
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
    {
      headers: authHeaders(token),
    },
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    return response.json();
  });
}

export function fetchHomepage(token?: string): Promise<HomepageResponse> {
  return fetch(`${import.meta.env.VITE_API_URL}/api/medias/home`, {
    headers: authHeaders(token),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    return response.json();
  });
}

export function fetchSuggestions(token: string): Promise<SuggestionsResponse> {
  return fetch(`${import.meta.env.VITE_API_URL}/api/me/suggestions`, {
    headers: authHeaders(token),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    return response.json();
  });
}

export function fetchCalendar(
  type: CalendarFormat,
  token?: string,
): Promise<CalendarGroup[]> {
  return fetch(
    `${import.meta.env.VITE_API_URL}/api/medias/calendar?type=${type}`,
    { headers: authHeaders(token) },
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    return response.json();
  });
}

export default fetchDiscover;
