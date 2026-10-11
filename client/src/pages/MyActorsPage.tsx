import { ArrowLeft, Check, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { Link } from "react-router";
import ActorSection from "../components/profile/ActorSection";
import useFavoriteActors from "../hooks/useFavoriteActors";
import useMediaQuery from "../hooks/useMediaQuery";
import { fetchMostWatchedActors } from "../services/favoriteApi";

function usePageSize() {
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 800px)");

  if (isXl) {
    return 8;
  }
  if (isLg) {
    return 6;
  }
  if (isMd) {
    return 4;
  }
  return 3;
}

function MyActorsPage() {
  const pageSize = usePageSize();
  const mostWatched = useFavoriteActors(pageSize, fetchMostWatchedActors);
  const {
    actors,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    showLess,
  } = useFavoriteActors(pageSize);

  return (
    <div className="space-y-6">
      <div className="flex w-full justify-end px-4 pt-6">
        <Link
          to="/profile"
          aria-label="Retour au profil"
          className="flex shrink-0 items-center gap-2 rounded-full border border-base-content/30 p-2.5 text-sm transition-colors hover:border-primary hover:text-primary lg:px-4 lg:py-2"
        >
          <ArrowLeft size={16} />
          <span className="hidden lg:inline">Retour</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold md:text-3xl">Mes Acteurs</h1>

      <ActorSection
        title="Favoris"
        icon={Heart}
        iconClassName="text-accent"
        fillIcon
        actors={actors}
      >
        {loading && <span className="loading loading-spinner text-primary" />}

        {!loading && error && (
          <p className="text-focus-muted">
            Impossible de charger vos acteurs favoris. Merci d'actualiser la
            page.
          </p>
        )}

        {!loading && !error && actors.length === 0 && (
          <p className="text-focus-muted">
            Vous n'avez pas encore d'acteur favori. Ajoutez-en depuis la fiche
            d'un acteur avec le ♥.
          </p>
        )}

        {(hasMore || actors.length > pageSize) && (
          <div className="flex flex-col items-center gap-2">
            {loadMoreError && (
              <p className="text-sm text-focus-muted">
                Impossible de charger la suite. Réessaie.
              </p>
            )}
            <div className="flex justify-center gap-3">
              {actors.length > pageSize && (
                <button
                  type="button"
                  onClick={showLess}
                  className="btn-cta-pill"
                >
                  Voir moins
                  <ChevronUp size={16} />
                </button>
              )}
              {hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
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
              )}
            </div>
          </div>
        )}
      </ActorSection>

      <ActorSection
        title="Les plus vus"
        icon={Check}
        iconClassName="text-success"
        actors={mostWatched.actors}
      >
        {mostWatched.loading && (
          <span className="loading loading-spinner text-primary" />
        )}

        {!mostWatched.loading && mostWatched.error && (
          <p className="text-focus-muted">
            Impossible de charger vos acteurs les plus vus. Merci d'actualiser
            la page.
          </p>
        )}

        {!mostWatched.loading &&
          !mostWatched.error &&
          mostWatched.actors.length === 0 && (
            <p className="text-focus-muted">
              Ajoutez des médias à votre liste de « vus » pour découvrir vos
              comédiens les plus vus.
            </p>
          )}

        {(mostWatched.hasMore || mostWatched.actors.length > pageSize) && (
          <div className="flex flex-col items-center gap-2">
            {mostWatched.loadMoreError && (
              <p className="text-sm text-focus-muted">
                Impossible de charger la suite. Réessaie.
              </p>
            )}
            <div className="flex justify-center gap-3">
              {mostWatched.actors.length > pageSize && (
                <button
                  type="button"
                  onClick={mostWatched.showLess}
                  className="btn-cta-pill"
                >
                  Voir moins
                  <ChevronUp size={16} />
                </button>
              )}
              {mostWatched.hasMore && (
                <button
                  type="button"
                  onClick={mostWatched.loadMore}
                  disabled={mostWatched.loadingMore}
                  className="btn-cta-pill"
                >
                  {mostWatched.loadingMore ? (
                    "Chargement…"
                  ) : (
                    <>
                      Voir plus
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </ActorSection>
    </div>
  );
}

export default MyActorsPage;
