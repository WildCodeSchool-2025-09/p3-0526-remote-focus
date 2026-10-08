import { ArrowLeft, ChevronDown, Heart } from "lucide-react";
import { Link } from "react-router";
import ActorSection from "../components/profile/ActorSection";
import useFavoriteActors from "../hooks/useFavoriteActors";

function MyActorsPage() {
  const {
    actors,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
  } = useFavoriteActors();

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

      {/* La section « Les plus vus » (US suivante) se placera ici, au-dessus des favoris. */}

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

        {hasMore && (
          <div className="flex flex-col items-center gap-2">
            {loadMoreError && (
              <p className="text-sm text-focus-muted">
                Impossible de charger la suite. Réessaie.
              </p>
            )}
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
          </div>
        )}
      </ActorSection>
    </div>
  );
}

export default MyActorsPage;
