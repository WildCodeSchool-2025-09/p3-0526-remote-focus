import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import EpisodeHeader from "../components/Episode/EpisodeHeader";
import KnownFrom from "../components/KnownFrom";
import useFetch from "../hooks/useFetch";
import type { EpisodeDetail as EpisodeDetailType } from "../types/media";

function EpisodeDetail() {
  const { seriesId, seasonId, episodeId } = useParams();
  const navigate = useNavigate();

  const {
    data: episodeDetail,
    loading,
    error,
  } = useFetch<EpisodeDetailType>(
    seriesId != null && seasonId != null && episodeId != null
      ? `/api/series/${seriesId}/seasons/${seasonId}/episodes/${episodeId}`
      : null,
  );
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  const handleSelectPerson = (personId: number) => {
    setSelectedPersonId(personId);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

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

        <button
          type="button"
          onClick={handleGoBack}
          aria-label="Retour"
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/30 p-2.5 text-sm transition-colors hover:border-[#F2B705] hover:text-[#F2B705] lg:px-4 lg:py-2"
        >
          <ArrowLeft size={16} />
          <span className="hidden lg:inline">Retour</span>
        </button>
      </div>

      <EpisodeHeader episode={episodeDetail} />

      <CastList
        cast={episodeDetail.cast}
        castTotal={episodeDetail.castTotal}
        selectedPersonId={selectedPersonId}
        onSelectPerson={handleSelectPerson}
      />

      {selectedPersonId != null && (
        <KnownFrom
          personId={selectedPersonId}
          mediaId={episodeDetail.serie.id}
        />
      )}
    </div>
  );
}

export default EpisodeDetail;
