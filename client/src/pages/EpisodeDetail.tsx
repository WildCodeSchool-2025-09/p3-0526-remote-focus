import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ActorKnownForWidget from "../components/ActorKnownForWidget";
import BackButton from "../components/BackButton";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import EpisodeHeader from "../components/EpisodeHeader";
import { useAuth } from "../contexts/AuthContext";
import { fetchEpisode } from "../services/api";
import type { EpisodeDetail as EpisodeDetailData } from "../types/media";

function EpisodeDetail() {
  const { serieId, seasonId, episodeId } = useParams();
  const { token } = useAuth();

  const [episodeDetail, setEpisodeDetail] = useState<EpisodeDetailData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  useEffect(() => {
    if (serieId == null || seasonId == null || episodeId == null) {
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    fetchEpisode(
      Number(serieId),
      Number(seasonId),
      Number(episodeId),
      token ?? undefined,
    )
      .then((data) => {
        if (active) {
          setEpisodeDetail(data);
        }
      })
      .catch(() => {
        if (active) {
          setError("Cet épisode est introuvable.");
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
  }, [serieId, seasonId, episodeId, token]);

  const handleSelectPerson = (personId: number) => {
    setSelectedPersonId((current) => (current === personId ? null : personId));
  };

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || episodeDetail == null) {
    return <p className="p-8 text-focus-muted">{error ?? "Erreur"}</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Breadcrumb
          currentLabel={episodeDetail.name ?? `Épisode ${episodeDetail.number}`}
          format="tv"
          trail={[
            {
              label: episodeDetail.series.name,
              to: `/series/${episodeDetail.series.id}`,
            },
            {
              label:
                episodeDetail.season.name ??
                `Saison ${episodeDetail.season.number}`,
              to: `/series/${episodeDetail.series.id}/seasons/${episodeDetail.season.id}`,
            },
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
      />
      {selectedPersonId != null && (
        <ActorKnownForWidget
          personId={selectedPersonId}
          excludeMediaId={episodeDetail.series.id}
        />
      )}
    </div>
  );
}

export default EpisodeDetail;
