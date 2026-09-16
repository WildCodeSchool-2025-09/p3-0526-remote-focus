import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchEpisodes } from "../services/api";
import type { Episode } from "../types/media";
import { formatDuration } from "../utils/formatDuration";

type EpisodeListProps = {
  seasonId: number;
};

function EpisodeList({ seasonId }: EpisodeListProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    fetchEpisodes(seasonId)
      .then((data) => {
        if (active) {
          setEpisodes(data);
        }
      })
      .catch(() => {
        if (active) {
          setError("Épisodes indisponibles.");
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
  }, [seasonId]);

  if (loading) {
    return <p className="px-4 pb-4 text-sm text-[#9FB4BD]">Chargement…</p>;
  }

  if (error != null) {
    return <p className="px-4 pb-4 text-sm text-[#9FB4BD]">{error}</p>;
  }

  if (episodes.length === 0) {
    return (
      <p className="px-4 pb-4 text-sm text-[#9FB4BD]">Aucun épisode listé.</p>
    );
  }

  return (
    <ul className="flex flex-col">
      {episodes.map((episode) => (
        <li
          key={episode.id}
          className="flex items-center gap-4 px-4 py-3 md:px-6"
        >
          <span className="w-6 shrink-0 text-sm text-[#9FB4BD]">
            {String(episode.number ?? 0).padStart(2, "0")}
          </span>

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-base">{episode.name}</span>
            {episode.duration != null && (
              <span className="text-sm text-[#9FB4BD]">
                {formatDuration(episode.duration)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled
            aria-label="Marquer comme vu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#17B890] text-[#17B890]"
          >
            <Check size={16} strokeWidth={2} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default EpisodeList;
