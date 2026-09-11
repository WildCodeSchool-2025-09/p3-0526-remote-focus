import { useEffect, useState } from "react";
import { useParams } from "react-router";
import BackButton from "../components/BackButton";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import EpisodeDetailList from "../components/EpisodeDetailList";
import KnownFrom from "../components/KnownFrom";
import SeasonHeader from "../components/SeasonHeader";
import { fetchSeason } from "../services/api";
import type { SeasonDetail as SeasonDetailData } from "../types/media";

function SeasonDetail() {
  const { serieId, seasonId } = useParams();

  const [seasonDetail, setSeasonDetail] = useState<SeasonDetailData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  useEffect(() => {
    if (serieId == null || seasonId == null) {
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    fetchSeason(Number(serieId), Number(seasonId))
      .then((data) => {
        if (active) {
          setSeasonDetail(data);
        }
      })
      .catch(() => {
        if (active) {
          setError("Cette saison est introuvable.");
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
  }, [serieId, seasonId]);

  const handleSelectPerson = (personId: number) => {
    setSelectedPersonId(personId);
  };

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || seasonDetail == null) {
    return <p className="p-8 text-focus-muted">{error ?? "Erreur"}</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Breadcrumb
          currentLabel={seasonDetail.name ?? `Saison ${seasonDetail.number}`}
          format="tv"
          trail={[
            {
              label: seasonDetail.series.name,
              to: `/series/${seasonDetail.series.id}`,
            },
          ]}
        />
        <BackButton />
      </div>
      <SeasonHeader season={seasonDetail} />
      <EpisodeDetailList
        episodes={seasonDetail.episodes}
        fallbackPoster={seasonDetail.poster}
      />
      <CastList
        cast={seasonDetail.cast}
        castTotal={seasonDetail.castTotal}
        selectedPersonId={selectedPersonId}
        onSelectPerson={handleSelectPerson}
      />
      {selectedPersonId != null && (
        <KnownFrom
          personId={selectedPersonId}
          mediaId={seasonDetail.series.id}
        />
      )}
    </div>
  );
}

export default SeasonDetail;
