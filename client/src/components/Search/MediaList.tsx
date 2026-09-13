//ne pas commit
import type { Media } from "../../types/Search";
import MediaCard from "./SearchMediaCard";

type MediaListProps = {
  title: string;
  medias: Media[];
};

const MediaList = ({ title, medias }: MediaListProps) => {
  if (medias.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2>{title}</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
        {medias.map((media) => (
          <MediaCard key={media.id} media={media} />
        ))}
      </div>
    </section>
  );
};

export default MediaList;
