import { useState } from "react";
import { useParams } from "react-router";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import KnownFrom from "../components/KnownFrom";
import MovieHeader from "../components/movie/MovieHeader";
import useFetch from "../hooks/useFetch";
import type { Media } from "../types/media";

function MovieDetail() {
  const { id } = useParams();

  const {
    data: mediaDetail,
    loading,
    error,
  } = useFetch<Media>(id != null ? `/api/medias/${id}` : null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  const handleSelectPerson = (personId: number) => {
    setSelectedPersonId(personId);
  };

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
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 p-4 md:p-8">
      <Breadcrumb
        items={[
          { label: "Accueil", path: "/" },
          { label: "Catalogue", path: "/catalog" },
          { label: "Films", path: "/catalog?type=movie" },
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
        <KnownFrom personId={selectedPersonId} mediaId={mediaDetail.id} />
      )}
    </div>
  );
}

export default MovieDetail;
