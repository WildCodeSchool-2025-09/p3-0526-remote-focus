import { Star } from "lucide-react";
import type { EnrichedMedia, Media } from "../types/Catalog";
import { Link } from "react-router";

interface MediaCardProps {
  media: EnrichedMedia;
  className: string;
}

function MediaCard({ media, className }: MediaCardProps) {
  return (
    <div className={className}>
      <Link to={`/${media.type}s/${media.id}`}>
        <img
          src={`https://image.tmdb.org/t/p/w342/${media.poster}`}
          alt={`${media.name} poster`}
          className="rounded-box"
        />
        <h4>{media.name}</h4>
        <p className="text-focus-muted-dark text-xs flex items-center gap-2">
          {media.releasedAt ? String(media.releasedAt).slice(0, 4) : "-"} ·
          <Star fill="#F2B705" color="#F2B705" size={12} />
          {media.overallRating}/10
        </p>
      </Link>
    </div>
  );
}

export default MediaCard;
