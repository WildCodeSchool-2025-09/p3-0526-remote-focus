import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchFilmography } from "../../services/api";
import type { FilmographyItem } from "../../types/media";
import MediaCard from "../Catalog/MediaCard";

type ActorFilmographyProps = {
  personId: number;
};

function ActorFilmography({ personId }: ActorFilmographyProps) {
  const [items, setItems] = useState<FilmographyItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const generation = useRef(0);

  useEffect(() => {
    generation.current += 1;

    let cancelled = false;

    setItems([]);
    setPage(1);
    setHasMore(false);
    setLoading(true);
    setError(false);

    fetchFilmography(personId)
      .then((data) => {
        if (!cancelled) {
          setItems(data.items);
          setHasMore(data.hasMore);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [personId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    const generationAtStart = generation.current;

    setLoadingMore(true);
    setError(false);

    fetchFilmography(personId, { page: nextPage })
      .then((data) => {
        if (generation.current !== generationAtStart) {
          return;
        }
        setItems((previous) => [...previous, ...data.items]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      })
      .catch(() => {
        if (generation.current === generationAtStart) {
          setError(true);
        }
      })
      .finally(() => setLoadingMore(false));
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold md:text-2xl">Filmographie</h2>

      {loading && <span className="loading loading-spinner text-primary" />}

      {error && <p className="text-focus-muted">Filmographie indisponible.</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-focus-muted">Aucune œuvre disponible.</p>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <div key={item.id}>
              <MediaCard
                media={{ ...item, topRank: null, isNew: false }}
                className="card"
                showGenre={false}
              />
              {item.characterName != null && (
                <p className="text-sm text-[#F2B705]">{item.characterName}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-cta-pill"
          >
            {loadingMore ? (
              "Chargement…"
            ) : (
              <>
                Voir plus
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

export default ActorFilmography;
