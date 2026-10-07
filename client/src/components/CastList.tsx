import { useEffect, useRef, useState } from "react";
import type { CastMember, CastPage } from "../types/media";
import ActorPortraitCard from "./ActorPortraitCard";

type CastListProps = {
  cast: CastMember[];
  castTotal: number;
  selectedPersonId: number | null;
  onSelectPerson: (personId: number) => void;
  fetchMore?: (page: number) => Promise<CastPage>;
};

function CastList({
  cast,
  castTotal,
  selectedPersonId,
  onSelectPerson,
  fetchMore,
}: CastListProps) {
  const [items, setItems] = useState<CastMember[]>(cast);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(castTotal > cast.length);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const generation = useRef(0);

  // Quand on change de média, on repart des 10 premiers acteurs
  useEffect(() => {
    generation.current += 1;
    setItems(cast);
    setPage(1);
    setHasMore(castTotal > cast.length);
    setLoadingMore(false);
    setLoadMoreError(false);
  }, [cast, castTotal]);

  const handleLoadMore = () => {
    if (fetchMore == null) {
      return;
    }

    const nextPage = page + 1;
    const generationAtStart = generation.current;

    setLoadingMore(true);
    setLoadMoreError(false);

    fetchMore(nextPage)
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
          setLoadMoreError(true);
        }
      })
      .finally(() => {
        if (generation.current === generationAtStart) {
          setLoadingMore(false);
        }
      });
  };

  if (items.length === 0) {
    return null;
  }

  const remaining = castTotal - items.length;
  const showMore = hasMore && remaining > 0;

  return (
    <section className="relative flex min-w-0 flex-col gap-4">
      <h2 className="text-xl font-bold md:text-2xl">
        Comédiens &amp; personnages
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-2 md:gap-5">
        {items.map((person, index) => (
          <ActorPortraitCard
            key={`${person.id}-${index}`}
            person={person}
            isSelected={person.id === selectedPersonId}
            onSelect={onSelectPerson}
          />
        ))}

        {showMore && fetchMore != null && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            aria-label={`Voir plus de comédiens (${remaining} restants)`}
            className="group flex w-[104px] shrink-0 flex-col items-center gap-2 pt-1 disabled:cursor-wait md:w-[140px]"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-base-content/25 text-sm font-semibold text-base-content/60 transition-colors group-hover:border-primary group-hover:text-primary md:h-24 md:w-24">
              {loadingMore ? (
                <span className="loading loading-spinner loading-sm text-primary" />
              ) : (
                `+${remaining}`
              )}
            </span>
            <span className="text-center text-sm text-base-content/60 group-hover:text-primary">
              {loadMoreError ? "Erreur, réessayer" : "Voir plus"}
            </span>
          </button>
        )}

        {showMore && fetchMore == null && (
          <div className="flex w-[104px] shrink-0 flex-col items-center gap-2 pt-1 md:w-[140px]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-base-content/25 text-sm font-semibold text-base-content/60 md:h-24 md:w-24">
              +{remaining}
            </div>
            <span className="text-center text-sm text-base-content/60">
              Voir tout le casting
            </span>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 top-12 w-16 bg-gradient-to-l from-base-100 to-transparent" />
    </section>
  );
}

export default CastList;
