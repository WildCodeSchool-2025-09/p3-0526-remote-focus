import { Star } from "lucide-react";
import { Link } from "react-router";
import type { SearchMedia } from "../../types/Search";
import { formatRating } from "../../utils/formatRating";
import { getMediaPath } from "../../utils/mediaPath";
import MediaCardActions from "../MediaCardActions";

type SearchResultCardProps = {
  media: SearchMedia;
};

function SearchResultCard({ media }: SearchResultCardProps) {
  const year = media.releasedAt
    ? new Date(media.releasedAt).getFullYear()
    : null;

  return (
    <Link
      to={getMediaPath(media.type, media.id)}
      className="relative flex w-[120px] shrink-0 flex-col gap-2 md:w-[170px]"
    >
      <MediaCardActions mediaId={media.id} mediaType={media.type} />
      {media.poster != null ? (
        <img
          src={`https://image.tmdb.org/t/p/w342${media.poster}`}
          alt={media.name}
          className="h-[180px] w-[120px] rounded-lg object-cover md:h-[255px] md:w-[170px]"
        />
      ) : (
        <div className="h-[180px] w-[120px] rounded-lg bg-white/10 md:h-[255px] md:w-[170px]" />
      )}

      <div className="flex flex-col gap-0.5">
        <span className="text-base font-semibold">{media.name}</span>
        <span className="text-focus-muted-dark flex items-center gap-1 text-sm">
          {year != null && <span>{year}</span>}
          {media.overallRating != null && (
            <span className="flex items-center gap-1">
              <Star fill="#F2B705" color="#F2B705" size={12} />
              {formatRating(media.overallRating)}
            </span>
          )}
          {media.pegi != null && (
            <span className="badge badge-outline badge-sm">
              PEGI {media.pegi}
            </span>
          )}
        </span>
      </div>
    </Link>
  );
}

export default SearchResultCard;
