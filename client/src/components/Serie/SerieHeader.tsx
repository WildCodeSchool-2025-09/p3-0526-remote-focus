import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useWatch } from "../../contexts/WatchingContext";
import type { Serie } from "../../types/media";
import { formatSerieStatus } from "../../utils/formatSerieStatus";
import PlatformList from "../PlatformList";
import TrackActions from "../TrackActions";
import SerieInfo from "./SerieInfo";

type SerieHeaderProps = {
  serie: Serie;
};

const PILL = "rounded-full border border-focus-cream/30 px-4 py-2 text-sm";

const PILL_ACTIVE =
  "rounded-full border border-focus-yellow bg-focus-yellow px-4 py-2 text-sm font-semibold text-focus-void";

function SerieHeader({ serie }: SerieHeaderProps) {
  const [isMetaOpen, setIsMetaOpen] = useState(false);

  const year = serie.releasedAt
    ? new Date(serie.releasedAt).getFullYear()
    : null;

  function handleToggleMeta() {
    setIsMetaOpen(!isMetaOpen);
  }

  const { isWatched, toggleWatchedSeries } = useWatch();
  const isSeriesComplete = isWatched(serie.id);

  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 md:grid-cols-[264px_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:gap-8">
      {serie.poster != null && (
        <img
          src={`https://image.tmdb.org/t/p/w500${serie.poster}`}
          alt={serie.name}
          className="col-start-1 row-start-1 h-48 w-32 rounded-lg object-cover md:row-span-2 md:h-[396px] md:w-[264px]"
        />
      )}

      <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-3 md:gap-4">
        <h1 className="text-2xl font-bold md:text-4xl">{serie.name}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {serie.genres.map((genre) => (
            <span key={genre.id} className={PILL_ACTIVE}>
              {genre.name}
            </span>
          ))}

          {year != null && <span className={PILL}>{year}</span>}

          <button
            type="button"
            onClick={handleToggleMeta}
            aria-expanded={isMetaOpen}
            aria-label="Afficher plus d'informations"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-focus-cream/30 text-sm md:hidden ${
              isMetaOpen ? "text-focus-yellow" : "text-focus-cream"
            }`}
          >
            {isMetaOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <div
            className={`${
              isMetaOpen ? "flex" : "hidden"
            } w-full flex-wrap gap-2 rounded-lg border border-focus-cream/15 bg-focus-surface p-2 md:contents md:w-auto md:border-0 md:bg-transparent md:p-0`}
          >
            {serie.originalLanguage != null && (
              <span className={PILL}>
                VO : {serie.originalLanguage.toUpperCase()}
              </span>
            )}

            {serie.seasons.length > 0 && (
              <span className={PILL}>
                {serie.seasons.length} saison
                {serie.seasons.length > 1 ? "s" : ""}
              </span>
            )}

            {serie.overallRating != null && (
              <span className={PILL}>★ {serie.overallRating}</span>
            )}

            {serie.status != null && (
              <span className={PILL}>{formatSerieStatus(serie.status)}</span>
            )}

            {serie.pegi != null && (
              <span className={PILL}>PEGI {serie.pegi}</span>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-2 row-start-2 flex flex-col gap-4 md:col-span-1 md:col-start-2">
        <SerieInfo serie={serie} />

        <div className="flex flex-wrap items-start gap-4">
          <TrackActions
            mediaId={serie.id}
            mediaName={serie.name}
            showWatchlist
            showSeen
            isSeen={isSeriesComplete}
            onSeenClick={() => toggleWatchedSeries(serie.id)}
            showRating
          />

          <PlatformList platforms={serie.platforms} />
        </div>
      </div>
    </div>
  );
}

export default SerieHeader;
