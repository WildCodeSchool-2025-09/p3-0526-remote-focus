import { Star } from "lucide-react";
import { Link } from "react-router";
import type { EnrichedMedia } from "../../types/Catalog";
import { formatRating } from "../../utils/formatRating";
import { getMediaPath } from "../../utils/mediaPath";
import MediaCardActions from "../MediaCardActions";

interface MediaCardProps {
  media: EnrichedMedia;
  className: string;
}

const RANK_LABEL: Record<"top3" | "top10", string> = {
  top3: "Top 3",
  top10: "Top 10",
};

function MediaCard({ media, className }: MediaCardProps) {
  const badgeLabel = media.topRank
    ? RANK_LABEL[media.topRank]
    : media.isNew
      ? "Nouveau"
      : null;

  return (
    <div className={className}>
      <Link to={getMediaPath(media.type, media.id)} className="relative block">
        <MediaCardActions
          mediaId={media.id}
          mediaType={media.type}
          initialIsWatched={media.isWatched}
        />
        {badgeLabel != null && (
          <span className="badge badge-primary absolute left-2 top-2 z-10">
            {badgeLabel}
          </span>
        )}
        {media.pegi != null && (
          <span className="badge badge-outline badge-sm absolute bottom-2 left-2 z-10 bg-base-100">
            PEGI {media.pegi}
          </span>
        )}
        <img
          src={`https://image.tmdb.org/t/p/w342/${media.poster}`}
          alt={`${media.name} poster`}
          className="rounded-box"
        />
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
            {formatRating(media.overallRating)}
          </span>
        </p>
      </Link>
    </div>
  );
}

export default MediaCard;
