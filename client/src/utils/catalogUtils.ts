import type { MediaType } from "../types/Catalog";

export function isValidMediaType(type: string): type is MediaType {
  return ["movie", "tv", "anime"].includes(type);
}

export function getPaginationPages(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (totalPages > 7 && currentPage < 6) {
    return [
      ...Array.from({ length: 5 }, (_, index) => index + 1),
      "...",
      totalPages,
    ];
  }
  if (totalPages > 7 && currentPage >= totalPages - 4) {
    return [
      1,
      "...",
      ...Array.from({ length: 5 }, (_, index) => index + (totalPages - 4)),
    ];
  }

  return [
    1,
    "...",
    ...Array.from({ length: 3 }, (_, index) => index + (currentPage - 1)),
    "...",
    totalPages,
  ];
}
