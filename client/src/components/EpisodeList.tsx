import { Check } from "lucide-react";
import type { Episode } from "../types/media";
import { formatDuration } from "../utils/formatDuration";

type EpisodeListProps = {
  episodes: Episode[];
};

function EpisodeList({ episodes }: EpisodeListProps) {
  return (
    <ul className="flex flex-col">
      {episodes.map((episode) => (
        <li
          key={episode.id}
          className="flex items-start gap-4 border-t border-white/10 px-4 py-3 md:items-center md:px-6"
        >
          <span className="w-6 shrink-0 text-sm text-[#9FB4BD]">
            {String(episode.number ?? 0).padStart(2, "0")}
          </span>

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-base md:truncate">{episode.name}</span>
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
