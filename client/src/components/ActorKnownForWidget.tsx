import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { fetchKnownFor } from "../services/api";
import type { KnownForMode, SearchMedia } from "../types/Search";
import SearchResultCard from "./Search/SearchResultCard";

type ActorKnownForWidgetProps = {
  personId: number;
  excludeMediaId: number;
};

function ActorKnownForWidget({
  personId,
  excludeMediaId,
}: ActorKnownForWidgetProps) {
  const { token } = useAuth();
  const [mode, setMode] = useState<KnownForMode>("top-rated");
  const [items, setItems] = useState<SearchMedia[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(false);

    fetchKnownFor(personId, excludeMediaId, 1, token ?? undefined)
      .then((result) => {
        if (!active) {
          return;
        }
        setMode(result.mode);
        setItems(result.data);
        setPage(1);
        setHasMore(result.pagination?.hasMore ?? false);
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
  }, [personId, excludeMediaId, token]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setLoading(true);

    fetchKnownFor(personId, excludeMediaId, nextPage, token ?? undefined)
      .then((result) => {
        setItems((current) => [...current, ...result.data]);
        setPage(nextPage);
        setHasMore(result.pagination?.hasMore ?? false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  const title = mode === "seen" ? "Vous le connaissez déjà dans" : "Connu pour";

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-white/10 bg-[#0F242F] p-4 md:gap-5 md:p-6">
      <h3 className="text-base font-semibold md:text-lg">{title}</h3>

      {loading && page === 1 && (
        <p className="text-sm text-[#9FB4BD]">Chargement…</p>
      )}

      {!loading && error && (
        <p className="text-sm text-[#9FB4BD]">
          Impossible de charger ce contenu.
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-[#9FB4BD]">
          {mode === "seen"
            ? "Vous n'avez rien vu avec cet acteur."
            : "Aucun autre titre à afficher."}
        </p>
      )}

      {items.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 md:gap-5">
          {items.map((media) => (
            <SearchResultCard key={media.id} media={media} />
          ))}
        </div>
      )}

      {mode === "seen" && hasMore && (
        <button
          type="button"
          className="btn btn-ghost btn-sm w-fit"
          onClick={handleLoadMore}
          disabled={loading}
        >
          Voir plus
        </button>
      )}

      <Link
        to={`/actors/${personId}`}
        className="text-sm text-[#F2B705] hover:underline"
      >
        Voir la fiche complète de l'acteur
      </Link>
    </div>
  );
}

export default ActorKnownForWidget;
