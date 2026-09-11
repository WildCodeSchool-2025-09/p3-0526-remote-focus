export function getMediaPath(type: string, id: number): string {
  return type === "tv" ? `/series/${id}` : `/movies/${id}`;
}
