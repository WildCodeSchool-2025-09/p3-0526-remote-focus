import { Check, Heart } from "lucide-react";
import { useState } from "react";
import type { SeasonDetail } from "../../types/media";
import { formatDuration } from "../../utils/formatDuration";
import ActionButton from "../ActionButton";
import PlatformList from "../PlatformList";

type SeasonHeaderProps = {
  season: SeasonDetail;
};

const PILL = "rounded-full border border-base-content/30 px-4 py-2 text-sm";

function SeasonHeader({ season }: SeasonHeaderProps) {
  const year = season.releasedAt
    ? new Date(season.releasedAt).getFullYear()
    : null;

  const [isMetaOpen, setIsMetaOpen] = useState(false);

  const handleToggleMeta = () => {
    setIsMetaOpen(!isMetaOpen);
  };

  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 md:grid-cols-[264px_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:gap-8">
      {season.poster != null && (
        <img
          src={`https://image.tmdb.org/t/p/w500${season.poster}`}
          alt={`${season.serie.name} - Saison ${season.number}`}
          className="col-start-1 row-start-1 h-48 w-32 rounded-lg object-cover md:row-span-2 md:h-[396px] md:w-[264px]"
        />
      )}

      <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-3 md:gap-4">
        <h1 className="text-2xl font-bold md:text-4xl">
          {season.serie.name} - Saison {season.number}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {year != null && <span className={PILL}>{year}</span>}
          {season.serie.originalLanguage != null && (
            <span className={PILL}>
              VO : {season.serie.originalLanguage.toUpperCase()}
            </span>
          )}

          <button
            type="button"
            onClick={handleToggleMeta}
            aria-expanded={isMetaOpen}
            aria-label="Afficher plus d'informations"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-base-content/30 text-sm md:hidden ${
              isMetaOpen ? "text-primary" : "text-base-content"
            }`}
          >
            {isMetaOpen ? "⌃" : "⌄"}
          </button>

          <div
            className={`${isMetaOpen ? "flex" : "hidden"} w-full flex-wrap gap-2 rounded-lg border border-base-content/15 bg-base-200 p-2 md:contents md:w-auto md:border-0 md:bg-transparent md:p-0`}
          >
            {season.episodeCount > 0 && (
              <span className={PILL}>
                {season.episodeCount} épisode
                {season.episodeCount > 1 ? "s" : ""}
              </span>
            )}
            {season.totalDuration != null && (
              <span className={PILL}>
                {formatDuration(season.totalDuration)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-2 row-start-2 flex flex-col gap-4 md:col-span-1 md:col-start-2">
        {season.synopsis != null && (
          <p className="max-w-[660px] text-base leading-relaxed text-base-content/80">
            {season.synopsis}
          </p>
        )}

        <div className="flex flex-wrap items-start gap-4">
          <ActionButton label="Favoris" color="#E83658" icon={Heart} />
          <ActionButton label="Vu" color="#17B890" icon={Check} />
          <PlatformList platforms={season.platforms} />
        </div>
      </div>
    </div>
  );
}

export default SeasonHeader;
