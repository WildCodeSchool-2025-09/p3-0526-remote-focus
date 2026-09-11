import { Clapperboard, MonitorPlay, Sparkles, Star } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";
import { Link } from "react-router";
import type { RatingScope } from "../../services/api";
import type { EnrichedMedia } from "../../types/Catalog";
import { formatRating } from "../../utils/formatRating";
import { getMediaPath } from "../../utils/mediaPath";
import MediaCardActions from "../MediaCardActions";
import RateMediaModal from "../RateMediaModal";

function TypePictogram({ media }: { media: EnrichedMedia }) {
  const Icon = media.isAnime
    ? Sparkles
    : media.type === "movie"
      ? Clapperboard
      : MonitorPlay;

  return (
    <span className="bg-primary absolute bottom-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full">
      <Icon size={16} color="#0D1117" />
    </span>
  );
}

interface MediaCardProps {
  media: EnrichedMedia;
  className: string;
}

const RANK_LABEL: Record<"top3" | "top10", string> = {
  top3: "Top 3",
  top10: "Top 10",
};

function MediaCard({ media, className }: MediaCardProps) {
  const [userRating, setUserRating] = useState(media.userRating);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const badgeLabel = media.topRank
    ? RANK_LABEL[media.topRank]
    : media.isNew
      ? "Nouveau"
      : null;

  const canRate = media.isWatched === true && media.userRating !== undefined;
  const ratingScope: RatingScope = media.type === "movie" ? "movie" : "series";

  const handleOpenRating = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsRatingModalOpen(true);
  };

  return (
    <div className={className}>
      <Link to={getMediaPath(media.type, media.id)} className="relative block">
        <MediaCardActions
          mediaId={media.id}
          mediaType={media.type}
          initialIsWatched={media.isWatched}
        />
        {badgeLabel != null && (
          <span
            className={`badge absolute left-2 top-2 z-10 ${
              media.topRank ? "badge-secondary" : "badge-accent"
            }`}
          >
            {badgeLabel}
          </span>
        )}
        <TypePictogram media={media} />
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

        {canRate && (
          <button
            type="button"
            onClick={handleOpenRating}
            className="pointer-events-none text-xs text-focus-yellow underline md:pointer-events-auto"
          >
            {userRating != null ? `Ma note : ${userRating}/5` : "Noter"}
          </button>
        )}
      </Link>

      {isRatingModalOpen && (
        <RateMediaModal
          scope={ratingScope}
          mediaId={media.id}
          initialRating={
            typeof userRating === "string"
              ? Number(userRating)
              : (userRating ?? null)
          }
          onClose={() => setIsRatingModalOpen(false)}
          onRated={setUserRating}
        />
      )}
    </div>
  );
}

export default MediaCard;
