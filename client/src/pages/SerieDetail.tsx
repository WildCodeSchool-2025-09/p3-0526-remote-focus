import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import KnownFrom from "../components/KnownFrom";
import { fetchSerie } from "../services/api";
import type { Serie } from "../types/media";
import SerieHeader from "../components/SerieHeader";

function SerieDetail() {
  const { id } = useParams();

  const [serieDetail, setSerieDetail] = useState<Serie | null>(null);
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

    fetchSerie(Number(id))
      .then((data) => {
        if (active) {
          setSerieDetail(data);
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
    setSelectedPersonId(personId);
  };

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || serieDetail == null) {
    return <p className="p-8 text-focus-muted">{error ?? "Erreur"}</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 p-4 md:p-8">
      <Breadcrumb
        currentLabel={serieDetail.name}
        categoryLabel="Séries"
        categoryPath="/catalog?type=tv"
      />
      <SerieHeader serie={serieDetail} />
      <CastList
        cast={serieDetail.cast}
        castTotal={serieDetail.castTotal}
        selectedPersonId={selectedPersonId}
        onSelectPerson={handleSelectPerson}
      />
      {selectedPersonId != null && (
        <KnownFrom personId={selectedPersonId} mediaId={serieDetail.id} />
      )}
    </div>
  );
}

export default SerieDetail;
