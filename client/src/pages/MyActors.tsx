import { useEffect, useState } from "react";
import ActorSeenCard from "../components/MyActors/ActorSeenCard";
import { useAuth } from "../contexts/AuthContext";
import { fetchMyActors } from "../services/api";
import type { ActorWithSeenCount } from "../types/Profile";

const PAGE_SIZE = 6;

function MyActors() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<ActorWithSeenCount[]>([]);
  const [mostViewed, setMostViewed] = useState<ActorWithSeenCount[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (token == null) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(false);

    fetchMyActors(token, 1, PAGE_SIZE)
      .then((data) => {
        if (active) {
          setFavorites(data.favorites.data);
          setMostViewed(data.mostViewed);
          setTotal(data.favorites.pagination.total);
          setPage(1);
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
  }, [token]);

  const handleLoadMore = () => {
    if (token == null) {
      return;
    }

    const nextPage = page + 1;
    setLoadingMore(true);

    fetchMyActors(token, nextPage, PAGE_SIZE)
      .then((data) => {
        setFavorites((current) => [...current, ...data.favorites.data]);
        setTotal(data.favorites.pagination.total);
        setPage(nextPage);
      })
      .catch(() => setError(true))
      .finally(() => setLoadingMore(false));
  };

  const hasMoreFavorites = favorites.length < total;

  if (loading) {
    return <span className="loading loading-spinner text-primary mt-8" />;
  }

  if (error) {
    return (
      <p className="text-error mt-8">
        Impossible de charger vos acteurs, réessayez plus tard.
      </p>
    );
  }

  return (
    <div>
      <h1>Mes acteurs</h1>

      <section className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">Les plus vus</h2>
        {mostViewed.length === 0 ? (
          <p className="text-focus-muted-dark">
            Ajoutez des médias à votre liste "vu" pour voir apparaître vos
            acteurs les plus vus ici.
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {mostViewed.map((actor) => (
              <ActorSeenCard key={actor.id} {...actor} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-9">
        <h2 className="mb-4 text-lg font-semibold">Favoris</h2>
        {favorites.length === 0 ? (
          <p className="text-focus-muted-dark">
            Vous n'avez pas encore d'acteur favori.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {favorites.map((actor) => (
              <ActorSeenCard key={actor.id} {...actor} />
            ))}
          </div>
        )}

        {hasMoreFavorites && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Chargement..." : "Voir plus"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default MyActors;
