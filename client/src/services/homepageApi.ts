import type { HomepageData } from "../types/Homepage";

export async function fetchHomepage(): Promise<HomepageData> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/medias/home`,
  );

  if (!response.ok) {
    throw new Error("Impossible de charger la page d'accueil");
  }

  return response.json();
}
