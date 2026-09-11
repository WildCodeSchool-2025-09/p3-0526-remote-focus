export function formatRating(rating: number | string | null): string {
  if (rating == null) {
    return "";
  }

  return `${Number(rating).toFixed(1)}/10`;
}
