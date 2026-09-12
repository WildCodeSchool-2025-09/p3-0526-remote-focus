import { Clapperboard, Sparkles, Star, TvMinimalPlay } from "lucide-react";
import type { EnrichedMedia } from "../../types/Catalog";
import { Link } from "react-router";
import MediaActions from "./MediaActions";

interface MediaCardProps {
  media: EnrichedMedia;
  className: string;
}

function MediaCard({ media, className }: MediaCardProps) {
  let mediaIcon = null;

  if (media.type === "movie") {
    mediaIcon = <Clapperboard size={20} />;
  } else if (media.isAnime) {
    mediaIcon = <Sparkles size={20} />;
  } else if (media.type === "tv") {
    mediaIcon = <TvMinimalPlay size={20} />;
  }

  let topNewBadge = null;
  let topRankBadge = null;

  if (media.isNew) {
    topNewBadge = "Nouveau";
  }

  if (media.topRank === "top3") {
    topRankBadge = "Top 3";
  } else if (media.topRank === "top10") {
    topRankBadge = "Top 10";
  }

  let urlDetails = null;

  if (media.type === "movie") {
    urlDetails = "movies";
  } else if (media.isAnime) {
    urlDetails = "animes";
  } else if (media.type === "tv") {
    urlDetails = "tv";
  }

  return (
    <div className={`${className} relative`}>
      <Link to={`/${urlDetails}/${media.id}`}>
        <div className="relative">
          {topNewBadge && (
            <span className="absolute px-2.5 py-1 top-2 left-2 text-xs bg-focus-coral rounded-btn font-semibold shadow-badge">
              {topNewBadge}
            </span>
          )}
          {topRankBadge && (
            <span
              className={`absolute px-2.5 py-1 left-2 text-xs bg-focus-teal rounded-btn font-semibold text-focus-void shadow-badge ${
                topNewBadge ? "top-10" : "top-2"
              }`}
            >
              {topRankBadge}
            </span>
          )}
          <img
            src={`https://image.tmdb.org/t/p/w342/${media.poster}`}
            alt={`${media.name} poster`}
            className="rounded-box"
          />
          {mediaIcon && (
            <span
              className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full badge-primary shadow-badge"
              title={media.isAnime ? "anime" : `${media.type}`}
            >
              {mediaIcon}
            </span>
          )}
        </div>
        <h4
          className="line-clamp-2 min-h-12 content-center font-display font-semibold text-base"
          title={`${media.name}`}
        >
          {media.name}
        </h4>
        <p className="text-focus-muted-dark text-xs flex items-center gap-1 whitespace-nowrap">
          <span className="min-w-0 truncate" title={`${media.genreName}`}>
            {media.genreName}
          </span>
          ·
          <span className="shrink-0">
            {media.releasedAt ? String(media.releasedAt).slice(0, 4) : "-"}
          </span>
          ·
          <span className="flex shrink-0 gap-1 justify-start">
            <Star fill="#F2B705" color="#F2B705" size={12} className="mt-px" />
            {media.overallRating}/10
          </span>
        </p>
      </Link>
      <MediaActions media={media} />
    </div>
  );
}

export default MediaCard;
