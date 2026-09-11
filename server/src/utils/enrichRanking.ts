import type { EnrichedMedia, Media } from "../types/Media/Media.types";

const NEW_RELEASE_WINDOW_DAYS = 30;

export function isMediaNew(releasedAt: Date | string | null): boolean {
  const today = new Date();

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - NEW_RELEASE_WINDOW_DAYS);

  const releasedAtDate = releasedAt ? new Date(releasedAt) : null;

  return (
    releasedAtDate !== null &&
    releasedAtDate >= windowStart &&
    releasedAtDate <= today
  );
}

export function enrichRanking(medias: Media[], offset = 0): EnrichedMedia[] {
  return medias.map((media, index) => {
    const position = offset + index + 1;

    let topRank: "top3" | "top10" | null = null;

    if (position <= 3) {
      topRank = "top3";
    } else if (position <= 10) {
      topRank = "top10";
    }

    return { ...media, topRank, isNew: isMediaNew(media.releasedAt) };
  });
}
