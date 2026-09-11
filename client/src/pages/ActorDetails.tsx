import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import ActorFilmography from "../components/ActorFilmography";
import ActorHeader from "../components/ActorHeader";
import ActorInfo from "../components/ActorInfo";
import BackButton from "../components/BackButton";
import { useAuth } from "../contexts/AuthContext";
import { fetchActor } from "../services/api";
import type { Actor } from "../types/media";

function ActorDetails() {
  const { id } = useParams();
  const { token } = useAuth();

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

    fetchActor(Number(id), token ?? undefined)
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
  }, [id, token]);

  if (loading) {
    return <p className="p-8 text-focus-muted">Chargement…</p>;
  }

  if (error != null || actor == null) {
    return <p className="p-8 text-focus-muted">{error ?? "Erreur"}</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav
          aria-label="Fil d'Ariane"
          className="flex flex-wrap items-center gap-2 text-sm text-[#9FB4BD]"
        >
          <Link to="/" className="hover:text-[#F5F5F0]">
            Accueil
          </Link>
          <span className="text-[#5E7079]">›</span>
          <span className="font-medium text-[#F2B705]">{actor.name}</span>
        </nav>
        <BackButton />
      </div>
      <ActorHeader actor={actor} />
      <ActorInfo actor={actor} />
      <ActorFilmography actorId={actor.id} />
    </div>
  );
}

export default ActorDetails;
