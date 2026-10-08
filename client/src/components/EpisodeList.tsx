import { Link } from "react-router";
import type { Episode } from "../types/media";
import { formatDuration } from "../utils/formatDuration";
import EpisodeWatchToggle from "./Episode/EpisodeWatchToggle";

type EpisodeListProps = {
  episodes: Episode[];
  seriesId: number;
  seasonId: number;
};

function EpisodeList({ episodes, seriesId, seasonId }: EpisodeListProps) {
  return (
    <ul className="flex flex-col">
      {episodes.map((episode) => (
        <li
          key={episode.id}
          className="flex items-start gap-4 border-t border-base-content/10 px-4 py-3 md:items-center md:px-6"
        >
          <Link
            to={`/series/${seriesId}/seasons/${seasonId}/episodes/${episode.id}`}
            className="flex min-w-0 flex-1 items-start gap-4 md:items-center"
          >
            <span className="w-6 shrink-0 text-sm text-focus-muted">
              {String(episode.number ?? 0).padStart(2, "0")}
            </span>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-base hover:underline md:truncate">
                {episode.name}
              </span>
              {episode.duration != null && (
                <span className="text-sm text-focus-muted">
                  {formatDuration(episode.duration)}
                </span>
              )}
            </div>
          </Link>
          <EpisodeWatchToggle episodeId={episode.id} />
        </li>
      ))}
    </ul>
  );
}

export default EpisodeList;
