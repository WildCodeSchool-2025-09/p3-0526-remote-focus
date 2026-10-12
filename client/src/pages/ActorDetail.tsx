import { useEffect, useState } from "react";
import { useParams } from "react-router";
import BackButton from "../components/BackButton";
import Breadcrumb from "../components/Breadcrumb";
import ActorFilmography from "../components/actor/ActorFilmography";
import ActorHeader from "../components/actor/ActorHeader";
import { fetchActor } from "../services/api";
import type { Actor } from "../types/media";

function ActorDetail() {
  const { id } = useParams();

  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id == null) {
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    fetchActor(Number(id))
      .then((data) => {
        if (active) {
          setActor(data);
        }
      })
      .catch(() => {
        if (active) {
          setError("Ce comédien est introuvable.");
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

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || actor == null) {
    return <p className="p-8 text-focus-muted">{error ?? "Erreur"}</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 pt-4">
      <div className="flex items-start justify-between gap-4">
        <Breadcrumb
          items={[
            { label: "Accueil", to: "/" },
            { label: "Catalogue", to: "/catalog" },
            { label: actor.name },
          ]}
        />

        <BackButton />
      </div>

      <ActorHeader actor={actor} />
      <ActorFilmography personId={actor.id} />
    </div>
  );
}

export default ActorDetail;
