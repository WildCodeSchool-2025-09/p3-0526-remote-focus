const GENRE_PALETTE = ["#F2B705", "#17B890", "#E83658", "#2E6373"];
const OTHER_GENRE_COLOR = "#9FB4BD";

export function getGenreColor(genre: string, index: number): string {
  if (genre === "Autres") {
    return OTHER_GENRE_COLOR;
  }

  return GENRE_PALETTE[index % GENRE_PALETTE.length];
}
