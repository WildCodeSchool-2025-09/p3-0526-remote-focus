import type { HomepageData } from "../types/homepage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

export async function fetchHomepage(): Promise<HomepageData> {
  const response = await fetch(`${API_URL}/api/medias/home`);

  if (!response.ok) {
    throw new Error("Impossible de charger la page d'accueil");
  }

  return response.json();
}
