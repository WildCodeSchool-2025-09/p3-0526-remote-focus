import type { Media } from "../../types/Search";
import MediaCard from "./SearchMediaCard";

type MediaListProps = {
  title?: string;
  medias: Media[];
};

const MediaList = ({ title, medias }: MediaListProps) => {
  if (medias.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      {title && <h2>{title}</h2>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {medias.map((media) => (
          <MediaCard key={media.id} media={media} />
        ))}
      </div>
    </section>
  );
};

export default MediaList;
