import type { KnownForResponse } from "../types/media";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

export async function fetchKnownFor(
  personId: number,
  excludeMediaId: number,
  page = 1,
): Promise<KnownForResponse> {
  const response = await fetch(
    `${API_URL}/api/actors/${personId}/known-for?exclude=${excludeMediaId}&page=${page}`,
  );

  if (!response.ok) {
    throw new Error("Filmographie indisponible");
  }

  return response.json();
}
