import { Clapperboard, Sparkles, Star, TvMinimalPlay } from "lucide-react";
import type { EnrichedMedia } from "../types/Homepage";
import { Link } from "react-router";
import MediaActions from "./MediaActions";

interface HomeMediaCardProps {
  media: EnrichedMedia;
  className?: string;
  showTypeIcon?: boolean;
}

function HomeMediaCard({
  media,
  className,
  showTypeIcon = true,
}: HomeMediaCardProps) {
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

  let TypeIcon = null;

  if (showTypeIcon) {
    if (media.type === "movie") {
      TypeIcon = Clapperboard;
    } else if (media.isAnime) {
      TypeIcon = Sparkles;
    } else if (media.type === "tv") {
      TypeIcon = TvMinimalPlay;
    }
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
          {media.poster != null ? (
            <img
              src={`https://image.tmdb.org/t/p/w342/${media.poster}`}
              alt={`${media.name} poster`}
              className="rounded-box w-full aspect-[2/3] object-cover"
            />
          ) : (
            <div className="rounded-box w-full aspect-[2/3] bg-white/10" />
          )}
          {TypeIcon && (
            <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-base-100/80 text-base-content shadow-badge">
              <TypeIcon size={12} />
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

export default HomeMediaCard;
