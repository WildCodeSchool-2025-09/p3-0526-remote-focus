import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ActorKnownForWidget from "../components/ActorKnownForWidget";
import BackButton from "../components/BackButton";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import SeasonList from "../components/SeasonList";
import SerieHeader from "../components/SerieHeader";
import { fetchSeries } from "../services/api";
import type { Series } from "../types/media";

function SerieDetail() {
  const { id } = useParams();

  const [seriesDetail, setSeriesDetail] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  useEffect(() => {
    if (id == null) {
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    fetchSeries(Number(id))
      .then((data) => {
        if (active) {
          setSeriesDetail(data);
        }
      })
      .catch(() => {
        if (active) {
          setError("Cette série est introuvable.");
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
  }, [id]);

  const handleSelectPerson = (personId: number) => {
    setSelectedPersonId((current) => (current === personId ? null : personId));
  };

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || seriesDetail == null) {
    return <p className="p-8 text-focus-muted">{error ?? "Erreur"}</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Breadcrumb currentLabel={seriesDetail.name} format="tv" />
        <BackButton />
      </div>
      <SerieHeader series={seriesDetail} />
      <SeasonList seriesId={seriesDetail.id} seasons={seriesDetail.seasons} />
      <CastList
        cast={seriesDetail.cast}
        castTotal={seriesDetail.castTotal}
        selectedPersonId={selectedPersonId}
        onSelectPerson={handleSelectPerson}
      />
      {selectedPersonId != null && (
        <ActorKnownForWidget
          personId={selectedPersonId}
          excludeMediaId={seriesDetail.id}
        />
      )}
    </div>
  );
}

export default SerieDetail;
