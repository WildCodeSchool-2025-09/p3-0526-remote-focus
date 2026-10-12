import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import type { Episode } from "../types/media";
import { formatDuration } from "../utils/formatDuration";
import EpisodeWatchToggle from "./Episode/EpisodeWatchToggle";

const EPISODES_PAGE_SIZE = 20;

type EpisodeListProps = {
  episodes: Episode[];
  seriesId: number;
  seasonId: number;
};

function EpisodeList({ episodes, seriesId, seasonId }: EpisodeListProps) {
  const [visibleCount, setVisibleCount] = useState(EPISODES_PAGE_SIZE);
  const [currentSeasonId, setCurrentSeasonId] = useState(seasonId);
  const listRef = useRef<HTMLDivElement>(null);

  // Quand on change de saison, on repart des 20 premiers épisodes
  if (seasonId !== currentSeasonId) {
    setCurrentSeasonId(seasonId);
    setVisibleCount(EPISODES_PAGE_SIZE);
  }

  const visibleEpisodes = episodes.slice(0, visibleCount);
  const hasMore = episodes.length > visibleCount;
  const canShowLess = visibleCount > EPISODES_PAGE_SIZE;

  const handleShowMore = () => {
    setVisibleCount(visibleCount + EPISODES_PAGE_SIZE);
  };

  const handleShowLess = () => {
    setVisibleCount(EPISODES_PAGE_SIZE);
    // On remonte au début de la liste pour ne pas se retrouver plus bas que les épisodes
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={listRef} className="flex scroll-mt-4 flex-col">
      <ul className="flex flex-col">
        {visibleEpisodes.map((episode) => (
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

      {(hasMore || canShowLess) && (
        <div className="flex flex-wrap justify-center gap-3 border-t border-base-content/10 px-4 py-4">
          {canShowLess && (
            <button
              type="button"
              onClick={handleShowLess}
              className="btn-cta-pill"
            >
              Voir moins
              <ChevronUp size={16} />
            </button>
          )}
          {hasMore && (
            <button
              type="button"
              onClick={handleShowMore}
              className="btn-cta-pill"
            >
              Voir plus
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EpisodeList;
