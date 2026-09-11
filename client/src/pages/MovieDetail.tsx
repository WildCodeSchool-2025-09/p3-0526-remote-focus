import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Breadcrumb from "../components/Breadcrumb";
import CastList from "../components/CastList";
import KnownFrom from "../components/KnownFrom";
import MediaHeader from "../components/MediaHeader";
import { fetchMedia } from "../services/api";
import type { Media } from "../types/media";

function MovieDetail() {
  const { id } = useParams();

  const [mediaDetail, setMediaDetail] = useState<Media | null>(null);
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

    fetchMedia(Number(id))
      .then((data) => {
        if (active) {
          setMediaDetail(data);
        }
      })
      .catch(() => {
        if (active) {
          setError("Ce film est introuvable.");
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

  if (error != null || mediaDetail == null) {
    return <p className="p-8 text-focus-muted">{error ?? "Erreur"}</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 p-4 md:p-8">
      <Breadcrumb currentLabel={mediaDetail.name} />
      <MediaHeader media={mediaDetail} />
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
