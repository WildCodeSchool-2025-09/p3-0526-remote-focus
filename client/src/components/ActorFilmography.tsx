import { useEffect, useState } from "react";
import { fetchActorFilmography } from "../services/api";
import type { FilmographyItem } from "../types/media";
import Carousel from "./Catalog/Carousel";
import MediaCard from "./MediaCard";

type SortOrder = "asc" | "desc";

type ActorFilmographyProps = {
  actorId: number;
};

function ActorFilmography({ actorId }: ActorFilmographyProps) {
  const [filmography, setFilmography] = useState<FilmographyItem[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(false);

    fetchActorFilmography(actorId, sortOrder)
      .then((data) => {
        if (active) {
          setFilmography(data);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
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
  }, [actorId, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "desc" ? "asc" : "desc"));
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold md:text-2xl">Filmographie</h2>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={toggleSortOrder}
        >
          {sortOrder === "desc" ? "Plus récent d'abord" : "Plus ancien d'abord"}
        </button>
      </div>

      {loading && <span className="loading loading-spinner text-primary" />}

      {!loading && error && (
        <p className="text-sm text-[#9FB4BD]">Filmographie indisponible.</p>
      )}

      {!loading && !error && filmography.length === 0 && (
        <p className="text-sm text-[#9FB4BD]">Aucune œuvre disponible.</p>
      )}

      {!loading && !error && filmography.length > 0 && (
        <Carousel>
          {filmography.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </Carousel>
      )}
    </section>
  );
}

export default ActorFilmography;
