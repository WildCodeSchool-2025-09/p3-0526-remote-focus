import { useEffect, useState } from "react";
import { fetchFilmography } from "../services/api";
import FilmographyCard from "./FilmographyCard";
import type { KnownForMedia } from "../types/media";
import { Link } from "react-router";
import { MoveRight } from "lucide-react";

type KnownForProps = {
  personId: number;
  mediaId: number;
  onClose: () => void;
};

function ActorKnownForWidget({ personId, mediaId, onClose }: KnownForProps) {
  const [items, setItems] = useState<KnownForMedia[]>([]);
  const [mode, setMode] = useState<"top-rated" | "seen">("top-rated");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setPage(1);
    setItems([]);
    setLoading(true);
    setError(null);

    fetchFilmography(personId, mediaId, 1)
      .then((data) => {
        if (active) {
          setItems(data.medias);
          setMode(data.mode);
          setTotalPages(data.pagination?.totalPages ?? 1);
        }
      })
      .catch(() => {
        if (active) {
          setError("Filmographie indisponible.");
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
  }, [personId, mediaId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;

    setLoading(true);

    fetchFilmography(personId, mediaId, nextPage)
      .then((data) => {
        setItems((currentItems) => [...currentItems, ...data.medias]);
        setPage(nextPage);
      })
      .catch(() => {
        setError("Impossible de charger les médias suivants.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-white/10 bg-[#0F242F] p-4 md:gap-5 md:p-6">
      <h3 className="text-base font-semibold md:text-lg">
        {mode === "seen" ? "Vous le connaissez déjà dans :" : "Connu pour :"}
      </h3>

      {loading && <p className="text-sm text-[#9FB4BD]">Chargement…</p>}

      {error != null && <p className="text-sm text-[#9FB4BD]">{error}</p>}

      {!loading && error == null && items.length === 0 && (
        <p className="text-sm text-[#9FB4BD]">
          {" "}
          {mode === "seen"
            ? "Vous n'avez rien vu avec cet acteur."
            : "Aucun titre à afficher."}
        </p>
      )}

      {items.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 md:gap-5">
          {items.map((item) => (
            <FilmographyCard key={item.id} item={item} onNavigate={onClose} />
          ))}
          {mode === "seen" && page < totalPages && !loading && (
            <button
              className="w-[120px] shrink-0 flex-col gap-2 md:w-[170px] self-center text-sm font-semibold text-focus-cream hover:underline underline-offset-8 hover:text-focus-yellow"
              type="button"
              onClick={handleLoadMore}
            >
              Voir plus ...
            </button>
          )}
        </div>
      )}
      <Link
        to={`/actors/${personId}`}
        className="flex gap-3 items-center text-sm text-focus-cream hover:text-focus-yellow"
      >
        Voir la fiche complète de l'acteur <MoveRight size={14} />
      </Link>
    </div>
  );
}

export default ActorKnownForWidget;
