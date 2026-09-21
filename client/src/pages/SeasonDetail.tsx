import { useEffect, useState } from "react";
import { useParams } from "react-router";
import CastList from "../components/CastList";
import KnownFrom from "../components/KnownFrom";
import { fetchSeason } from "../services/api";
import type { SeasonDetail as SeasonDetailType } from "../types/media";

function SeasonDetail() {
  const { seasonId } = useParams();

  const [seasonDetail, setSeasonDetail] = useState<SeasonDetailType | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  useEffect(() => {
    if (seasonId == null) {
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    fetchSeason(Number(seasonId))
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
  }, [seasonId]);

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
      <h1 className="text-2xl font-bold md:text-4xl">
        {seasonDetail.serie.name} - Saison {seasonDetail.number}
      </h1>
      <CastList
        cast={seasonDetail.cast}
        castTotal={seasonDetail.cast.length}
        selectedPersonId={selectedPersonId}
        onSelectPerson={handleSelectPerson}
      />
      {selectedPersonId != null && (
        <KnownFrom
          personId={selectedPersonId}
          mediaId={seasonDetail.serie.id}
        />
      )}
    </div>
  );
}

export default SeasonDetail;
