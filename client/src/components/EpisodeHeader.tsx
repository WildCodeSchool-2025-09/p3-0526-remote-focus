import { Check, Heart, Plus, Star } from "lucide-react";
import { Link } from "react-router";
import type { EpisodeDetail } from "../types/media";
import { formatDuration } from "../utils/formatDuration";
import { formatRating } from "../utils/formatRating";
import ActionButton from "./ActionButton";
import EpisodeInfo from "./EpisodeInfo";

type EpisodeHeaderProps = {
  episode: EpisodeDetail;
};

const PILL = "rounded-full border border-white/30 px-4 py-2 text-sm";

function EpisodeHeader({ episode }: EpisodeHeaderProps) {
  const year = episode.releasedAt
    ? new Date(episode.releasedAt).getFullYear()
    : null;

  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 md:grid-cols-[264px_minmax(0,1fr)] md:gap-8">
      {episode.poster != null && (
        <img
          src={`https://image.tmdb.org/t/p/w500${episode.poster}`}
          alt={episode.name ?? `Épisode ${episode.number}`}
          className="col-start-1 row-start-1 h-48 w-32 rounded-lg object-cover md:row-span-2 md:h-[396px] md:w-[264px]"
        />
      )}

      <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-2 md:gap-4">
        <div className="flex flex-wrap items-center gap-1 text-sm text-[#9FB4BD]">
          <Link
            to={`/series/${episode.series.id}`}
            className="hover:text-[#F5F5F0]"
          >
            {episode.series.name}
          </Link>
          <span>›</span>
          <Link
            to={`/series/${episode.series.id}/seasons/${episode.season.id}`}
            className="hover:text-[#F5F5F0]"
          >
            {episode.season.name ?? `Saison ${episode.season.number}`}
          </Link>
        </div>

        <h1 className="text-2xl font-bold md:text-4xl">
          {episode.number != null ? `${episode.number}. ` : ""}
          {episode.name ?? `Épisode ${episode.number}`}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {year != null && <span className={PILL}>{year}</span>}
          {episode.duration != null && (
            <span className={PILL}>{formatDuration(episode.duration)}</span>
          )}
          {episode.overallRating != null && (
            <span className={PILL}>
              ★ {formatRating(episode.overallRating)}
            </span>
          )}
        </div>
      </div>

      <div className="col-span-2 row-start-2 flex flex-col gap-4 md:col-span-1 md:col-start-2">
        <EpisodeInfo episode={episode} />

        <div className="flex flex-wrap items-start gap-4">
          <ActionButton label="Favoris" color="#E83658" icon={Heart} />
          <ActionButton label="Watchlist" color="#F5F5F0" icon={Plus} />
          <ActionButton label="Vu" color="#17B890" icon={Check} />
          <ActionButton label="Noter" color="#F2B705" icon={Star} />

          {episode.platforms.length > 0 && (
            <>
              <div className="hidden h-12 w-px bg-white/15 md:block" />
              <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#0F242F] p-2">
                {episode.platforms.map((platform) => (
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

export default EpisodeHeader;
