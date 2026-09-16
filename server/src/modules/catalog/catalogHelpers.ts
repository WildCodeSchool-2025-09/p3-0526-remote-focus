import type { LikedGenre } from "../../types/Genre/Genre.types";
import type { EnrichedMedia, Media } from "../../types/Media/Media.types";

export const isMediaNew = (releasedAt: Date | string | null): boolean => {
  const today = new Date();

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const releasedAtDate = releasedAt ? new Date(releasedAt) : null;

  return (
    releasedAtDate !== null &&
    releasedAtDate >= ninetyDaysAgo &&
    releasedAtDate <= today
  );
};

export const enrichRanking = (medias: Media[]): EnrichedMedia[] => {
  return medias.map((media, index) => {
    const position = index + 1;

    let topRank: "top3" | "top10" | null = null;

    if (position <= 3) {
      topRank = "top3";
    } else if (position <= 10) {
      topRank = "top10";
    }

    const isNew = isMediaNew(media.releasedAt);

    return { ...media, topRank, isNew };
  });
};

export const createGenreSections = (
  likedGenres: LikedGenre[],
  topGenres: Media[][],
  enrichedTopRated: EnrichedMedia[],
) => {
  const genreSections = likedGenres.map((likedGenre, index) => {
    const medias = topGenres[index].map((media) => {
      const rankedMedia = enrichedTopRated.find(
        (rankedMedia) => rankedMedia.id === media.id,
      );

      return {
        ...media,
        topRank: rankedMedia ? rankedMedia.topRank : null,
        isNew: isMediaNew(media.releasedAt),
      };
    });

    return {
      id: likedGenre.id,
      name: likedGenre.name,
      medias,
    };
  });
  return genreSections;
};
