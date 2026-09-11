import type { EnrichedMedia } from "../../types/Catalog";
import MediaCard from "./MediaCard";

type CatalogGridProps = {
  medias: EnrichedMedia[];
};

function CatalogGrid({ medias }: CatalogGridProps) {
  if (medias.length === 0) {
    return (
      <p className="text-focus-muted-dark mt-8">
        Aucun contenu ne correspond à ces filtres.
      </p>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {medias.map((media) => (
        <MediaCard key={media.id} media={media} className="" />
      ))}
    </div>
  );
}

export default CatalogGrid;
