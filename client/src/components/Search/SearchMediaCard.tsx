import type { Media } from "../../types/Search";
import MediaActions from "../Catalog/MediaActions";

type MediaCardProps = {
  media: Media;
};

const MediaCard = ({ media }: MediaCardProps) => {
  return (
    <div className="card bg-base-200 w-40 shrink-0 relative">
      <figure className="aspect-[2/3] bg-base-300">
        {media.poster != null && (
          <img
            src={`https://image.tmdb.org/t/p/w342/${media.poster}`}
            alt={media.name}
            className="h-full w-full object-cover"
          />
        )}
      </figure>
      <MediaActions media={media} />
      <div className="card-body p-3">
        <p className="text-sm font-medium leading-snug line-clamp-2">
          {media.name}
        </p>
      </div>
    </div>
  );
};

export default MediaCard;
