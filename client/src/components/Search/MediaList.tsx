import type { Media } from "../../types/search";
import MediaCard from "../Catalog/MediaCard";

type MediaListProps = {
  medias: Media[];
  showGenre?: boolean;
};

const MediaList = ({ medias, showGenre = true }: MediaListProps) => {
  if (medias.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap justify-center gap-4">
        {medias.map((media) => (
          <MediaCard
            key={media.id}
            media={{ ...media, topRank: null, isNew: false }}
            className="catalog-carousel-item w-48 lg:w-60"
            showGenre={showGenre}
          />
        ))}
      </div>
    </section>
  );
};

export default MediaList;
