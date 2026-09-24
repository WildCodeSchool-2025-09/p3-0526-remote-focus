import { useParams } from "react-router";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import ActorKnownForWidget from "../components/ActorKnownForWidget";
// import { fetchMedia } from "../services/api";
import MovieHeader from "../components/Movie/MovieHeader";
import type { Media } from "../types/media";
import useSelectedActor from "../hooks/useSelectedActor";
import useFetch from "../hooks/useFetch";

function MovieDetail() {
  const { id } = useParams();

  const {
    data: mediaDetail,
    loading,
    error,
  } = useFetch<Media>(id != null ? `/api/medias/${id}` : null);
  const { selectedPersonId, handleSelectPerson, handleCloseActorWidget } =
    useSelectedActor();

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || mediaDetail == null) {
    return <p className="p-8 text-focus-muted">Ce film est introuvable.</p>;
  }

  if (mediaDetail.type !== "movie") {
    return <p className="p-8 text-focus-muted">Ce média n'est pas un film.</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 pt-4 md:p-8">
      <Breadcrumb
        items={[
          { label: "Accueil", to: "/" },
          { label: "Catalogue", to: "/catalog" },
          { label: "Films", to: "/catalog?type=movie" },
          { label: mediaDetail.name },
        ]}
      />
      <MovieHeader media={mediaDetail} />
      <CastList
        cast={mediaDetail.cast}
        castTotal={mediaDetail.castTotal}
        selectedPersonId={selectedPersonId}
        onSelectPerson={handleSelectPerson}
      />
      {selectedPersonId != null && (
        <ActorKnownForWidget
          personId={selectedPersonId}
          mediaId={mediaDetail.id}
          onClose={handleCloseActorWidget}
        />
      )}
    </div>
  );
}

export default MovieDetail;
