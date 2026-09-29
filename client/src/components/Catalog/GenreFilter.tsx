import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { fetchGenres } from "../../services/catalogService";
import type { Genre } from "../../types/media";
import Carousel from "./Carousel";
import MediaCardLoading from "./MediaCardLoading";

interface GenreFilterProps {
  resetLabel?: string;
}

function GenreFilter({
  resetLabel = "Réinitialiser les genres et revenir au catalogue général",
}: GenreFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    fetchGenres()
      .then((data) => {
        setGenres(data);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement du catalogue :", error);
        setError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const urlGenres: number[] =
    searchParams
      .get("genre")
      ?.split(",")
      .map((genreParam) => Number(genreParam)) ?? [];

  function handleGenre(genreId: number) {
    const updatedGenres = urlGenres.includes(genreId)
      ? urlGenres.filter((id) => id !== genreId)
      : [...urlGenres, genreId];

    const newSearchParams = new URLSearchParams(searchParams);

    updatedGenres.length > 0
      ? newSearchParams.set("genre", updatedGenres.join(","))
      : newSearchParams.delete("genre");

    newSearchParams.delete("page");

    setSearchParams(newSearchParams);
  }

  function handleClearGenre() {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("genre");
    newSearchParams.delete("page");
    setSearchParams(newSearchParams);
  }

  if (isLoading) {
    return (
      <>
        <div className="carousel flex">
          {Array.from({ length: 10 }, (_, index) => index + 1).map(
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
  const pillClasses = (isActive: boolean) =>
    `${isActive ? "btn-genre-pill-active" : "btn-genre-pill"} !min-h-0 !h-8 !px-3 !py-1`;
  return (
    <div className="relative">
      <Carousel>
        {genres.map((genre) => (
          <button
            type="button"
            key={genre.id}
            className={pillClasses(urlGenres.includes(genre.id))}
            onClick={() => handleGenre(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </Carousel>
      {urlGenres.length > 0 ? (
        <button
          type="button"
          onClick={handleClearGenre}
          className="absolute inset-x-0 top-full mt-1 text-center text-sm hover:underline hover:text-focus-cream text-focus-muted-dark"
        >
          {resetLabel}
        </button>
      ) : null}
    </div>
  );
}

export default GenreFilter;
