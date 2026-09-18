import { useSearchParams } from "react-router";
import { isValidMediaType } from "../../hooks/catalogUtils";
import { useEffect, useMemo, useState } from "react";
import type { EnrichedMedia, Pagination } from "../../types/Catalog";
import { fetchPaginateMedias } from "../../services/catalogService";
import MediaCardLoading from "./MediaCardLoading";
import MediaCard from "./MediaCard";

function FilteredCatalog() {
  const [searchParams] = useSearchParams();
  const genreParam = searchParams.get("genre");
  const genres: number[] = useMemo(
    () => genreParam?.split(",").map((genre) => Number(genre)) ?? [],
    [genreParam],
  );
  const typeParam = searchParams.get("type");
  const type = typeParam && isValidMediaType(typeParam) ? typeParam : undefined;
  const page = Number(searchParams.get("page") ?? 1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [medias, setMedias] = useState<EnrichedMedia[]>([]);
  const [pagination, setPagination] = useState<Pagination>();

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setMedias([]);
    fetchPaginateMedias(genres, type, page)
      .then((data) => {
        setMedias(data.medias);
        setPagination(data.pagination);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement du catalogue :", error);
        setError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [genres, type, page]);

  console.log(medias);
  console.log(pagination);

  if (isLoading) {
    return (
      <>
        <div className="carousel flex">
          {Array.from({ length: 15 }, (_, index) => index + 1).map(
            (loadingId) => (
              <MediaCardLoading key={loadingId} />
            ),
          )}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <p className="m-12">
        Une erreur est survenue lors du chargement du catalogue. Merci
        d'actualiser la page.
      </p>
    );
  }

  if (medias.length === 0) {
    return <p className="m-12">Aucun média ne correspond à votre recherche</p>;
  }

  return (
    <section className="flex flex-wrap gap-4 mt-12 justify-center">
      {medias.map((media) => (
        <MediaCard
          key={media.id}
          media={media}
          className={"catalog-carousel-item w-48 lg:w-60"}
          showTypeIcon={!type}
          showGenre={false}
        />
      ))}
    </section>
  );
}

export default FilteredCatalog;
