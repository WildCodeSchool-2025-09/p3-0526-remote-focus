import type { Media } from "../../types/Search";
import MediaCard from "../Catalog/MediaCard";

type MediaListProps = {
  medias: Media[];
};

const MediaList = ({ medias }: MediaListProps) => {
  if (medias.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {medias.map((media) => (
          <MediaCard
            key={media.id}
            media={{ ...media, topRank: null, isNew: false }}
            className="card bg-base-200"
          />
        ))}
      </div>
    </section>
  );
};

export default MediaList;
