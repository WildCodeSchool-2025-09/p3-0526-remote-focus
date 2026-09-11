import { useEffect, useState } from "react";
import { fetchFilmography } from "../services/api";
import type { FilmographyItem } from "../types/media";
import MediaCard from "./MediaCard";

type KnownFromProps = {
  personId: number;
  mediaId: number;
};

function KnownFrom({ personId, mediaId }: KnownFromProps) {
  const [items, setItems] = useState<FilmographyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    fetchFilmography(personId, mediaId)
      .then((data) => {
        if (active) {
          setItems(data);
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

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-white/10 bg-[#0F242F] p-4 md:gap-5 md:p-6">
      <h3 className="text-base font-semibold md:text-lg">
        Vous le connaissez déjà dans :
      </h3>

      {loading && <p className="text-sm text-[#9FB4BD]">Chargement…</p>}

      {error != null && <p className="text-sm text-[#9FB4BD]">{error}</p>}

      {!loading && error == null && items.length === 0 && (
        <p className="text-sm text-[#9FB4BD]">Aucun autre titre à afficher.</p>
      )}

      {items.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 md:gap-5">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default KnownFrom;
