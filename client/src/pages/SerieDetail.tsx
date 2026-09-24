import { useParams } from "react-router";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import ActorKnownForWidget from "../components/ActorKnownForWidget";
// import { fetchSerie } from "../services/api";
import SeasonList from "../components/Serie/SeasonList";
import SerieHeader from "../components/Serie/SerieHeader";
import useFetch from "../hooks/useFetch";
import type { Serie } from "../types/media";
import useSelectedActor from "../hooks/useSelectedActor";

function SerieDetail() {
  const { id } = useParams();

  const {
    data: serieDetail,
    loading,
    error,
  } = useFetch<Serie>(id != null ? `/api/series/${id}` : null);
  const { selectedPersonId, handleSelectPerson, handleCloseActorWidget } =
    useSelectedActor();

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || serieDetail == null) {
    return <p className="p-8 text-focus-muted">Cette série est introuvable.</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 pt-4 md:p-8">
      <Breadcrumb
        items={[
          { label: "Accueil", to: "/" },
          { label: "Catalogue", to: "/catalog" },
          {
            label: serieDetail.isAnime ? "Animés" : "Séries",
            to: serieDetail.isAnime
              ? "/catalog?type=anime"
              : "/catalog?type=tv",
          },
          { label: serieDetail.name },
        ]}
      />
      <SerieHeader serie={serieDetail} />
      <SeasonList seasons={serieDetail.seasons} serieId={serieDetail.id} />
      <CastList
        cast={serieDetail.cast}
        castTotal={serieDetail.castTotal}
        selectedPersonId={selectedPersonId}
        onSelectPerson={handleSelectPerson}
      />
      {selectedPersonId != null && (
        <ActorKnownForWidget
          personId={selectedPersonId}
          mediaId={serieDetail.id}
          onClose={handleCloseActorWidget}
        />
      )}
    </div>
  );
}

export default SerieDetail;
