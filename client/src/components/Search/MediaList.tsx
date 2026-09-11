import type { SearchMedia } from "../../types/Search";
import Carousel from "../Catalog/Carousel";
import SearchResultCard from "./SearchResultCard";

type MediaListProps = {
  title: string;
  medias: SearchMedia[];
};

function MediaList({ title, medias }: MediaListProps) {
  if (medias.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2>{title}</h2>
      <Carousel>
        {medias.map((media) => (
          <SearchResultCard key={media.id} media={media} />
        ))}
      </Carousel>
    </section>
  );
}

export default MediaList;
