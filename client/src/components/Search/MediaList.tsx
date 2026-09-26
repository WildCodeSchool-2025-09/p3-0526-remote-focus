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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
        {medias.map((media) => (
          <MediaCard
            key={media.id}
            media={{ ...media, topRank: null, isNew: false }}
            className="card"
            showGenre={showGenre}
          />
        ))}
      </div>
    </section>
  );
};

export default MediaList;
