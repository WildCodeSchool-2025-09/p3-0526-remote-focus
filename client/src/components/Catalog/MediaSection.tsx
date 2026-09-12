import { Link } from "react-router";
import type { EnrichedMedia } from "../../types/Catalog";
import Carousel from "./Carousel";
import MediaCard from "./MediaCard";

interface MediaSectionProps {
  title: string;
  medias: EnrichedMedia[];
  searchParams: string | undefined;
  genreId?: number;
}

function MediaSection({
  title,
  medias,
  searchParams,
  genreId,
}: MediaSectionProps) {
  return (
    <>
      <h3 className="mt-9 mb-4">{title}</h3>
      {medias[0] ? (
        <Carousel>
          {medias.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              searchParams={searchParams}
              className="catalog-carousel-item"
            />
          ))}
          {genreId !== undefined && (
            <Link
              to=""
              className="catalog-carousel-item items-center justify-center bg-focus-surface/60 text-focus-muted-dark/60 rounded-box hover:bg-focus-surface hover:text-focus-muted transition-colors"
            >
              Voir tout
            </Link>
          )}
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
