import type { LucideIcon } from "lucide-react";
import { Check, Heart, Plus, Star } from "lucide-react";
import { useState } from "react";
import type { Media } from "../types/media";
import { formatDuration } from "../utils/formatDuration";
import MediaInfo from "./MediaInfo";

type MediaHeaderProps = {
  media: Media;
};

const PILL = "rounded-full border border-white/30 px-4 py-2 text-sm";
const PILL_ACTIVE =
  "rounded-full border border-[#F2B705] bg-[#F2B705] px-4 py-2 text-sm font-semibold text-[#0D1117]";

function MediaHeader({ media }: MediaHeaderProps) {
  const year = media.releasedAt
    ? new Date(media.releasedAt).getFullYear()
    : null;

  const [isMetaOpen, setIsMetaOpen] = useState(false);

  const handleToggleMeta = () => {
    setIsMetaOpen(!isMetaOpen);
  };

  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 md:grid-cols-[264px_minmax(0,1fr)] md:gap-8">
      {media.poster != null && (
        <img
          src={`https://image.tmdb.org/t/p/w500${media.poster}`}
          alt={media.name}
          className="col-start-1 row-start-1 h-48 w-32 rounded-lg object-cover md:row-span-2 md:h-[396px] md:w-[264px]"
        />
      )}

      <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-3 md:gap-4">
        <h1 className="text-2xl font-bold md:text-4xl">{media.name}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {media.genres.map((genre) => (
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 text-sm md:hidden"
            style={{ color: isMetaOpen ? "#F2B705" : "#F5F5F0" }}
          >
            {isMetaOpen ? "⌃" : "⌄"}
          </button>

          <div
            className={`${isMetaOpen ? "flex" : "hidden"} w-full flex-wrap gap-2 rounded-lg border border-white/15 bg-[#0F242F] p-2 md:contents md:w-auto md:border-0 md:bg-transparent md:p-0`}
          >
            {media.originalLanguage != null && (
              <span className={PILL}>
                VO : {media.originalLanguage.toUpperCase()}
              </span>
            )}
            {media.duration != null && (
              <span className={PILL}>{formatDuration(media.duration)}</span>
            )}
            {media.overallRating != null && (
              <span className={PILL}>★ {media.overallRating}</span>
            )}
            {media.pegi != null && (
              <span className={PILL}>PEGI {media.pegi}</span>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-2 row-start-2 flex flex-col gap-4 md:col-span-1 md:col-start-2">
        <MediaInfo media={media} />

        <div className="flex flex-wrap items-start gap-4">
          <ActionButton label="Favoris" color="#E83658" icon={Heart} />
          <ActionButton label="Watchlist" color="#F5F5F0" icon={Plus} />
          <ActionButton label="Vu" color="#17B890" icon={Check} />
          <ActionButton label="Noter" color="#F2B705" icon={Star} />

          {media.platforms.length > 0 && (
            <>
              <div className="hidden h-12 w-px bg-white/15 md:block" />
              <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#0F242F] p-2">
                {media.platforms.map((platform) => (
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

type ActionButtonProps = {
  label: string;
  color: string;
  icon: LucideIcon;
};

function ActionButton({ label, color, icon: Icon }: ActionButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 md:h-12 md:w-12"
        style={{ borderColor: color, color }}
      >
        <Icon size={22} strokeWidth={1.8} />
      </button>
      <span className="text-sm text-white/60">{label}</span>
    </div>
  );
}

export default MediaHeader;
