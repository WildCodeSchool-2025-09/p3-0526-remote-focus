import type { MediaType } from "../types/Catalog";

export function isValidMediaType(type: string): type is MediaType {
  return ["movie", "tv", "anime"].includes(type);
}
