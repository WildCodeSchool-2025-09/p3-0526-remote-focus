import type { KnownForResponse } from "../types/media";
import { API_URL } from "./api";

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
