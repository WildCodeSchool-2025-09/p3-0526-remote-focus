import { useEffect, useState } from "react";
import { fetchGenres } from "../../services/catalogService";
import type { Genre } from "../../types/media";
import Carousel from "./Carousel";

function GenreFilter() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isActive, setIsActive] = useState(false);

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

  return (
    <div>
      <Carousel>
        {genres.map((genre) => (
          <button type="button" key={genre.id} className="btn-genre-pill">
            {genre.name}
          </button>
        ))}
      </Carousel>
    </div>
  );
}

export default GenreFilter;
