import { useParams } from "react-router";
import ActorKnownForWidget from "../components/ActorKnownForWidget";
import BackButton from "../components/BackButton";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import EpisodeHeader from "../components/Episode/EpisodeHeader";
import useFetch from "../hooks/useFetch";
import useSelectedActor from "../hooks/useSelectedActor";
import { fetchEpisodeCast } from "../services/api";
import type { EpisodeDetail as EpisodeDetailType } from "../types/media";

function EpisodeDetail() {
  const { seriesId, seasonId, episodeId } = useParams();

  const {
    data: episodeDetail,
    loading,
    error,
  } = useFetch<EpisodeDetailType>(
    seriesId != null && seasonId != null && episodeId != null
      ? `/api/series/${seriesId}/seasons/${seasonId}/episodes/${episodeId}`
      : null,
  );
  const { selectedPersonId, handleSelectPerson, handleCloseActorWidget } =
    useSelectedActor();

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || episodeDetail == null) {
    return <p className="p-8 text-focus-muted">Cet épisode est introuvable.</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 pt-4">
      <div className="flex items-start justify-between gap-4">
        <Breadcrumb
          items={[
            { label: "Accueil", to: "/" },
            { label: "Catalogue", to: "/catalog" },
            episodeDetail.serie.isAnime
              ? { label: "Animés", to: "/catalog?type=anime" }
              : { label: "Séries", to: "/catalog?type=tv" },
            {
              label: episodeDetail.serie.name,
              to: `/${episodeDetail.serie.isAnime ? "animes" : "series"}/${episodeDetail.serie.id}`,
            },
            {
              label: `Saison ${episodeDetail.season.number}`,
              to: `/series/${episodeDetail.serie.id}/seasons/${episodeDetail.season.id}`,
            },
            { label: `Épisode ${episodeDetail.number}` },
          ]}
        />

        <BackButton />
      </div>

      <EpisodeHeader episode={episodeDetail} />

      <CastList
        cast={episodeDetail.cast}
        castTotal={episodeDetail.castTotal}
        selectedPersonId={selectedPersonId}
        onSelectPerson={handleSelectPerson}
        fetchMore={(page) =>
          fetchEpisodeCast(
            episodeDetail.serie.id,
            episodeDetail.season.id,
            episodeDetail.id,
            { page },
          )
        }
      />

      {selectedPersonId != null && (
        <ActorKnownForWidget
          personId={selectedPersonId}
          mediaId={episodeDetail.serie.id}
          onClose={handleCloseActorWidget}
        />
      )}
    </div>
  );
}

export default EpisodeDetail;
