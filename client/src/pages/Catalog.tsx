import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import CatalogGrid from "../components/Catalog/CatalogGrid";
import DiscoverSection from "../components/Catalog/DiscoverSection";
import FilterBar from "../components/Catalog/FilterBar";
import Pagination from "../components/Catalog/Pagination";
import { fetchGenres } from "../services/api";
import { fetchCatalog } from "../services/catalogService";
import type { CatalogResponse, Format } from "../types/Catalog";
import type { Genre } from "../types/media";

function parseFormat(value: string | null): Format {
  return value === "movie" || value === "tv" || value === "anime"
    ? value
    : null;
}

function parseGenres(value: string | null): number[] {
  if (value == null || value.length === 0) {
    return [];
  }

  return value
    .split(",")
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
}

function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedFormat = parseFormat(searchParams.get("type"));
  const selectedGenres = parseGenres(searchParams.get("genre"));
  const page =
    Number(searchParams.get("page")) > 0 ? Number(searchParams.get("page")) : 1;
  const isFiltered = selectedGenres.length > 0;

  const [genres, setGenres] = useState<Genre[]>([]);
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGenres()
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-derive from the URL query string as a whole rather than each parsed field, to avoid rerunning on new-array-reference alone
  useEffect(() => {
    if (!isFiltered) {
      return;
    }

    let active = true;
    setLoading(true);

    fetchCatalog(selectedFormat, selectedGenres, page)
      .then((data) => {
        if (active) {
          setCatalog(data);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [searchParams.toString()]);

  const updateParams = (next: {
    type?: Format;
    genre?: number[];
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams);

    if (next.type !== undefined) {
      if (next.type == null) {
        params.delete("type");
      } else {
        params.set("type", next.type);
      }
    }

    if (next.genre !== undefined) {
      if (next.genre.length === 0) {
        params.delete("genre");
      } else {
        params.set("genre", next.genre.join(","));
      }
    }

    if (next.page !== undefined && next.page > 1) {
      params.set("page", String(next.page));
    } else {
      params.delete("page");
    }

    setSearchParams(params);
  };

  const handleFormatChange = (format: Format) => {
    updateParams({ type: format });
  };

  const handleGenreToggle = (genreId: number) => {
    const nextGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter((id) => id !== genreId)
      : [...selectedGenres, genreId];

    updateParams({ genre: nextGenres });
  };

  const handleResetGenres = () => {
    updateParams({ genre: [] });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: nextPage });
  };

  return (
    <>
      <h1>Catalogue</h1>

      <FilterBar
        genres={genres}
        selectedFormat={selectedFormat}
        selectedGenres={selectedGenres}
        onFormatChange={handleFormatChange}
        onGenreToggle={handleGenreToggle}
        onResetGenres={handleResetGenres}
      />

      {isFiltered ? (
        <>
          {loading && (
            <span className="loading loading-spinner text-primary mt-8" />
          )}
          {!loading && catalog != null && (
            <>
              <CatalogGrid medias={catalog.data} />
              <Pagination
                pagination={catalog.pagination}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      ) : (
        <DiscoverSection />
      )}
    </>
  );
}

export default Catalog;
