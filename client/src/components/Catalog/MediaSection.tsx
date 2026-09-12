import type { EnrichedMedia } from "../../types/Catalog";
import Carousel from "./Carousel";
import MediaCard from "./MediaCard";

interface MediaSectionProps {
  title: string;
  medias: EnrichedMedia[];
}

function MediaSection({ title, medias }: MediaSectionProps) {
  return (
    <>
      <h3 className="mt-9 mb-4">{title}</h3>
      {medias[0] ? (
        <Carousel>
          {medias.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              className="catalog-carousel-item"
            />
          ))}
        </Carousel>
      ) : (
        <>
          <p className="mt-5 mb-16"> Aucun média à afficher </p>
        </>
      )}
    </>
  );
}

export default MediaSection;
