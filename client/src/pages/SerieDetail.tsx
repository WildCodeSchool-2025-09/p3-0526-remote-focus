import { useState } from "react";
import { useParams } from "react-router";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import KnownFrom from "../components/KnownFrom";
import SeasonList from "../components/serie/SeasonList";
import SerieHeader from "../components/serie/SerieHeader";
import useFetch from "../hooks/useFetch";
import type { Serie } from "../types/media";

function SerieDetail() {
  const { id } = useParams();

  const {
    data: serieDetail,
    loading,
    error,
  } = useFetch<Serie>(id != null ? `/api/series/${id}` : null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  const handleSelectPerson = (personId: number) => {
    setSelectedPersonId(personId);
  };

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || serieDetail == null) {
    return <p className="p-8 text-focus-muted">Cette série est introuvable.</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 p-4 md:p-8">
      <Breadcrumb
        items={[
          { label: "Accueil", path: "/" },
          { label: "Catalogue", path: "/catalog" },
          serieDetail.isAnime
            ? { label: "Animés", path: "/catalog?type=anime" }
            : { label: "Séries", path: "/catalog?type=tv" },
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
        <KnownFrom personId={selectedPersonId} mediaId={serieDetail.id} />
      )}
    </div>
  );
}

export default SerieDetail;
