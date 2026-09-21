export interface Genre {
  id: number;
  name: string;
}

export async function fetchGenres(): Promise<Genre[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/genres`);

  if (!response.ok) {
    throw new Error("Impossible de récupérer les genres.");
  }

  return (await response.json()) as Genre[];
}
