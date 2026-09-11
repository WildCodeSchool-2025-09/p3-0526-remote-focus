import { Check, Heart, Plus, Star } from "lucide-react";
import { useState } from "react";
import type { Series } from "../types/media";
import { formatDuration } from "../utils/formatDuration";
import { formatRating } from "../utils/formatRating";
import ActionButton from "./ActionButton";
import SerieInfo from "./SerieInfo";

type SerieHeaderProps = {
  series: Series;
};

const PILL = "rounded-full border border-white/30 px-4 py-2 text-sm";
const PILL_ACTIVE =
  "rounded-full border border-[#F2B705] bg-[#F2B705] px-4 py-2 text-sm font-semibold text-[#0D1117]";

function SerieHeader({ series }: SerieHeaderProps) {
  const year = series.releasedAt
    ? new Date(series.releasedAt).getFullYear()
    : null;

  const [isMetaOpen, setIsMetaOpen] = useState(false);

  const handleToggleMeta = () => {
    setIsMetaOpen(!isMetaOpen);
  };

  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 md:grid-cols-[264px_minmax(0,1fr)] md:gap-8">
      {series.poster != null && (
        <img
          src={`https://image.tmdb.org/t/p/w500${series.poster}`}
          alt={series.name}
          className="col-start-1 row-start-1 h-48 w-32 rounded-lg object-cover md:row-span-2 md:h-[396px] md:w-[264px]"
        />
      )}

      <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-3 md:gap-4">
        <h1 className="text-2xl font-bold md:text-4xl">{series.name}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {series.genres.map((genre) => (
            <span key={genre.id} className={PILL_ACTIVE}>
              {genre.name}
            </span>
          ))}
          {year != null && <span className={PILL}>{year}</span>}
          {series.status != null && (
            <span className={PILL}>{series.status}</span>
          )}

          <button
            type="button"
            onClick={handleToggleMeta}
            aria-expanded={isMetaOpen}
            aria-label="Afficher plus d'informations"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 text-sm md:hidden"
            style={{ color: isMetaOpen ? "#F2B705" : "#F5F5F0" }}
          >
            {isMetaOpen ? "⌃" : "⌄"}
          </button>

          <div
            className={`${isMetaOpen ? "flex" : "hidden"} w-full flex-wrap gap-2 rounded-lg border border-white/15 bg-[#0F242F] p-2 md:contents md:w-auto md:border-0 md:bg-transparent md:p-0`}
          >
            {series.originalLanguage != null && (
              <span className={PILL}>
                VO : {series.originalLanguage.toUpperCase()}
              </span>
            )}
            {series.totalDuration > 0 && (
              <span className={PILL}>
                {formatDuration(series.totalDuration)} au total
              </span>
            )}
            {series.averageEpisodeDuration != null && (
              <span className={PILL}>
                ~{formatDuration(series.averageEpisodeDuration)} / épisode
              </span>
            )}
            {series.overallRating != null && (
              <span className={PILL}>
                ★ {formatRating(series.overallRating)}
              </span>
            )}
            {series.pegi != null && (
              <span className={PILL}>PEGI {series.pegi}</span>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-2 row-start-2 flex flex-col gap-4 md:col-span-1 md:col-start-2">
        <SerieInfo series={series} />

        <div className="flex flex-wrap items-start gap-4">
          <ActionButton label="Favoris" color="#E83658" icon={Heart} />
          <ActionButton label="Watchlist" color="#F5F5F0" icon={Plus} />
          <ActionButton label="Vu" color="#17B890" icon={Check} />
          <ActionButton label="Noter" color="#F2B705" icon={Star} />

          {series.platforms.length > 0 && (
            <>
              <div className="hidden h-12 w-px bg-white/15 md:block" />
              <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#0F242F] p-2">
                {series.platforms.map((platform) => (
                  <img
                    key={platform.id}
                    src={`https://image.tmdb.org/t/p/w92${platform.logo}`}
                    alt={platform.name}
                    className="h-8 w-8 rounded object-contain"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SerieHeader;
