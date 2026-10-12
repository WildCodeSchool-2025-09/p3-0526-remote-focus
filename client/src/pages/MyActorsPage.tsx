import { Check, Heart } from "lucide-react";
import BackButton from "../components/BackButton";
import ActorSection from "../components/profile/ActorSection";
import LoadMoreControls from "../components/profile/LoadMoreControls";
import useMediaQuery from "../hooks/useMediaQuery";
import usePaginatedActors from "../hooks/usePaginatedActors";
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
  const favorites = usePaginatedActors(pageSize);
  const mostWatched = usePaginatedActors(pageSize, fetchMostWatchedActors);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 pt-6">
        <h1 className="text-2xl font-bold md:text-3xl">Mes Acteurs</h1>
        <BackButton />
      </div>

      <ActorSection
        title="Favoris"
        icon={Heart}
        iconClassName="text-accent"
        fillIcon
        actors={favorites.actors}
      >
        {favorites.loading && (
          <span className="loading loading-spinner text-primary" />
        )}

        {!favorites.loading && favorites.error && (
          <p className="text-focus-muted">
            Impossible de charger vos acteurs favoris. Merci d'actualiser la
            page.
          </p>
        )}

        {!favorites.loading &&
          !favorites.error &&
          favorites.actors.length === 0 && (
            <p className="text-focus-muted">
              Vous n'avez pas encore d'acteur favori. Ajoutez-en depuis la fiche
              d'un acteur avec le ♥.
            </p>
          )}

        <LoadMoreControls
          canShowLess={favorites.actors.length > pageSize}
          hasMore={favorites.hasMore}
          loadingMore={favorites.loadingMore}
          loadMoreError={favorites.loadMoreError}
          onShowLess={favorites.showLess}
          onLoadMore={favorites.loadMore}
        />
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

        <LoadMoreControls
          canShowLess={mostWatched.actors.length > pageSize}
          hasMore={mostWatched.hasMore}
          loadingMore={mostWatched.loadingMore}
          loadMoreError={mostWatched.loadMoreError}
          onShowLess={mostWatched.showLess}
          onLoadMore={mostWatched.loadMore}
        />
      </ActorSection>
    </div>
  );
}

export default MyActorsPage;
