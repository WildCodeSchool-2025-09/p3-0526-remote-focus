import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { getPaginationPages, isValidMediaType } from "../../hooks/catalogUtils";
import { fetchPaginateMedias } from "../../services/catalogService";
import type { EnrichedMedia, Pagination } from "../../types/Catalog";
import MediaCard from "./MediaCard";
import MediaCardLoading from "./MediaCardLoading";

function FilteredCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
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

  function handlePageChange(newPage: number) {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newSearchParams.delete("page");
    } else {
      newSearchParams.set("page", String(newPage));
    }
    setSearchParams(newSearchParams);
  }

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
    <>
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
      {pagination && (
        <nav aria-label="Pagination" className="flex justify-center m-6 gap-4">
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            disabled={pagination.page === 1}
            aria-label="Première page"
          >
            <ChevronsLeft color="#F5F5F0" />
          </button>
          <button
            type="button"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            aria-label="Page précédente"
          >
            <ChevronLeft color="#F5F5F0" />
          </button>
          {getPaginationPages(pagination.page, pagination.totalPages).map(
            (pageNumber, index) =>
              pageNumber === "..." ? (
                <span
                  key={index === 1 ? "ellipsis-start" : "ellipsis-end"}
                  aria-hidden="true"
                  className="text-focus-muted"
                >
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={pagination.page === pageNumber}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={
                    pagination.page === pageNumber ? "page" : undefined
                  }
                  className="text-base-content"
                >
                  {pageNumber}
                </button>
              ),
          )}
          <button
            type="button"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            aria-label="Page suivante"
          >
            <ChevronRight color="#F5F5F0" />
          </button>
          <button
            type="button"
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.page === pagination.totalPages}
            aria-label="Dernière page"
          >
            <ChevronsRight color="#F5F5F0" />
          </button>
        </nav>
      )}
    </>
  );
}

export default FilteredCatalog;
