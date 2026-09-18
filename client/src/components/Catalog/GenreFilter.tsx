import { useEffect, useState } from "react";
import { fetchGenres } from "../../services/catalogService";
import type { Genre } from "../../types/media";
import Carousel from "./Carousel";
import MediaCardLoading from "./MediaCardLoading";
import { useSearchParams } from "react-router";

function GenreFilter() {
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

  return (
    <div>
      <Carousel>
        {genres.map((genre) => (
          <button
            type="button"
            key={genre.id}
            className={
              urlGenres.includes(genre.id)
                ? "btn-genre-pill-active"
                : "btn-genre-pill"
            }
            onClick={() => handleGenre(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </Carousel>
    </div>
  );
}

export default GenreFilter;
