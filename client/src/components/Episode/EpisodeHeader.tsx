import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useWatch } from "../../contexts/WatchingContext";
import type { EpisodeDetail } from "../../types/media";
import { formatDuration } from "../../utils/formatDuration";
import ExpandableText from "../ExpandableText";
import PlatformList from "../PlatformList";
import TrackActions from "../TrackActions";

type EpisodeHeaderProps = {
  episode: EpisodeDetail;
};

const PILL = "rounded-full border border-focus-cream/30 px-4 py-2 text-sm";

function EpisodeHeader({ episode }: EpisodeHeaderProps) {
  const [isMetaOpen, setIsMetaOpen] = useState(false);
  const { isEpisodeWatched, toggleWatchedEpisode } = useWatch();
  const isThisEpisodeWatched = isEpisodeWatched(episode.id);

  const releasedAt = episode.releasedAt
    ? new Date(episode.releasedAt).toLocaleDateString("fr-FR")
    : null;

  function handleToggleMeta() {
    setIsMetaOpen(!isMetaOpen);
  }

  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 md:grid-cols-[264px_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:gap-8">
      {episode.poster != null && (
        <img
          src={`https://image.tmdb.org/t/p/w500${episode.poster}`}
          alt={episode.name ?? episode.serie.name}
          className="col-start-1 row-start-1 h-48 w-32 rounded-lg object-cover md:row-span-2 md:h-[396px] md:w-[264px]"
        />
      )}

      <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-3 md:gap-4">
        <h1 className="text-2xl font-bold md:text-4xl">
          {episode.name} – Épisode {episode.number} – Saison{" "}
          {episode.season.number}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {releasedAt != null && <span className={PILL}>{releasedAt}</span>}

          <button
            type="button"
            onClick={handleToggleMeta}
            aria-expanded={isMetaOpen}
            aria-controls="episode-meta-panel"
            aria-label="Afficher plus d'informations"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-focus-cream/30 text-sm md:hidden ${
              isMetaOpen ? "text-focus-yellow" : "text-focus-cream"
            }`}
          >
            {isMetaOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <div
            id="episode-meta-panel"
            className={`${
              isMetaOpen ? "flex" : "hidden"
            } w-full flex-wrap gap-2 rounded-lg border border-focus-cream/15 bg-focus-surface p-2 md:contents md:w-auto md:border-0 md:bg-transparent md:p-0`}
          >
            {episode.originalLanguage != null && (
              <span className={PILL}>
                VO : {episode.originalLanguage.toUpperCase()}
              </span>
            )}

            {episode.duration != null && (
              <span className={PILL}>{formatDuration(episode.duration)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-2 row-start-2 flex flex-col gap-4 md:col-span-1 md:col-start-2">
        {episode.synopsis != null && <ExpandableText text={episode.synopsis} />}

        <div className="flex flex-wrap items-start gap-4">
          <TrackActions
            mediaId={episode.serie.id}
            mediaName={episode.serie.name}
            showSeen
            isSeen={isThisEpisodeWatched}
            onSeenClick={() => toggleWatchedEpisode(episode.id)}
          />

          <PlatformList platforms={episode.platforms} />
        </div>
      </div>
    </div>
  );
}

export default EpisodeHeader;
