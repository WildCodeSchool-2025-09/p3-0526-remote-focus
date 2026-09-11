import { Clapperboard, Sparkles, Star, TvMinimalPlay } from "lucide-react";
import type { Media } from "../../types/Catalog";
import { Link } from "react-router";

interface MediaCardProps {
  media: Media;
  className: string;
}

function MediaCard({ media, className }: MediaCardProps) {
  let mediaIcon = null;

  if (media.type === "movie") {
    mediaIcon = <Clapperboard size={20} />;
  } else if (media.type === "tv" && media.isAnime) {
    mediaIcon = <Sparkles size={20} />;
  } else if (media.type === "tv") {
    mediaIcon = <TvMinimalPlay size={20} />;
  }

  let newTopBadge = null;
  let badgeColor = null;

  if (media.isNew) {
    newTopBadge = "Nouveau";
    badgeColor = "bg-focus-coral";
  } else if (media.topRank === "top3") {
    newTopBadge = "Top 3";
    badgeColor = "bg-focus-teal text-focus-void";
  } else if (media.topRank === "top10") {
    newTopBadge = "Top 10";
    badgeColor = "bg-focus-teal text-focus-void";
  }

  return (
    <div className={className}>
      <Link to={`/${media.type}s/${media.id}`}>
        <div className="relative">
          <span
            className={`absolute px-2.5 py-1 top-2 left-2 text-xs ${badgeColor} rounded-btn font-semibold`}
          >
            {newTopBadge}
          </span>
          <img
            src={`https://image.tmdb.org/t/p/w342/${media.poster}`}
            alt={`${media.name} poster`}
            className="rounded-box"
          />
          {mediaIcon && (
            <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full badge-primary shadow-[0_0_8px_-3px_black]">
              {mediaIcon}
            </span>
          )}
        </div>
        <h4
          className="line-clamp-2 min-h-12 content-center"
          title={`${media.name}`}
        >
          {media.name}
        </h4>
        <p className="text-focus-muted-dark text-xs flex items-center gap-1">
          {media.genreName} ·{" "}
          {media.releasedAt ? String(media.releasedAt).slice(0, 4) : "-"} ·
          <span className="flex gap-1 justify-start">
            <Star fill="#F2B705" color="#F2B705" size={12} className="mt-px" />
            {media.overallRating}/10
          </span>
        </p>
      </Link>
    </div>
  );
}

export default MediaCard;
