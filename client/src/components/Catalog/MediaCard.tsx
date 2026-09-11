import { Star } from "lucide-react";
import type { Media } from "../../types/Catalog";
import { Link } from "react-router";

interface MediaCardProps {
  media: Media;
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
            {media.overallRating !== null
              ? Number(media.overallRating)
              : media.overallRating}
            /10
          </span>
        </p>
      </Link>
    </div>
  );
}

export default MediaCard;
