import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ActionButton from "../components/ActionButton";
import Breadcrumb from "../components/Breadcrumb";
import { fetchPerson } from "../services/api";
import type { PersonDetail } from "../types/media";

function ActorDetail() {
  const { id } = useParams();

  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id == null) {
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    fetchPerson(Number(id))
      .then((data) => {
        if (active) {
          setPerson(data);
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

  if (error != null || person == null) {
    return <p className="p-8 text-focus-muted">{error ?? "Erreur"}</p>;
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-base-100 p-4 md:p-8">
      <Breadcrumb
        items={[
          { label: "Accueil", to: "/" },
          { label: "Catalogue", to: "/catalog" },
          { label: person.name },
        ]}
      />

      <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 md:grid-cols-[264px_minmax(0,1fr)] md:gap-8">
        {person.photo != null ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${person.photo}`}
            alt={person.name}
            className="h-48 w-32 rounded-lg object-cover md:h-[396px] md:w-[264px]"
          />
        ) : (
          <div className="h-48 w-32 rounded-lg bg-white/10 md:h-[396px] md:w-[264px]" />
        )}

        <div className="flex min-w-0 flex-col gap-4 md:gap-6">
          <h1 className="text-2xl font-bold md:text-4xl">{person.name}</h1>

          {person.biography != null && (
            <p className="max-w-[660px] text-base leading-relaxed text-[#C9D6DB]">
              {person.biography}
            </p>
          )}

          <ActionButton label="Favoris" color="#E83658" icon={Heart} />
        </div>
      </div>
    </div>
  );
}

export default ActorDetail;
