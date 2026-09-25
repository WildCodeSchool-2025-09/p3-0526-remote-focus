import { Link } from "react-router";
import useFetch from "../hooks/useFetch";
import type { FilmographyPage } from "../types/media";
import FilmographyCard from "./FilmographyCard";

type KnownFromProps = {
  personId: number;
  mediaId: number;
};

function KnownFrom({ personId, mediaId }: KnownFromProps) {
  const {
    data: filmography,
    loading,
    error,
  } = useFetch<FilmographyPage>(
    `/api/actors/${personId}/filmography?exclude=${mediaId}`,
  );

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-white/10 bg-[#0F242F] p-4 md:gap-5 md:p-6">
      <h3 className="text-base font-semibold md:text-lg">
        Vous le connaissez déjà dans :
      </h3>

      {loading && <p className="text-sm text-[#9FB4BD]">Chargement…</p>}

      {!loading && error != null && (
        <p className="text-sm text-[#9FB4BD]">Filmographie indisponible.</p>
      )}

      {!loading && error == null && filmography?.items.length === 0 && (
        <p className="text-sm text-[#9FB4BD]">Aucun autre titre à afficher.</p>
      )}

      {!loading && filmography != null && filmography.items.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 md:gap-5">
          {filmography.items.map((item) => (
            <FilmographyCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {!loading && error == null && (
        <Link
          to={`/actors/${personId}`}
          className="text-sm font-medium text-[#F2B705] hover:underline"
        >
          Voir la fiche complète de l'acteur →
        </Link>
      )}
    </div>
  );
}

export default KnownFrom;
