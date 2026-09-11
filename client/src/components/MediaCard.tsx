import { Link } from "react-router";
import type { FilmographyItem } from "../types/media";
import { getMediaPath } from "../utils/mediaPath";

type MediaCardProps = {
  item: FilmographyItem;
};

function MediaCard({ item }: MediaCardProps) {
  return (
    <Link
      to={getMediaPath(item.type, item.id)}
      className="flex w-[120px] shrink-0 flex-col gap-2 md:w-[170px]"
    >
      {item.poster != null ? (
        <img
          src={`https://image.tmdb.org/t/p/w342${item.poster}`}
          alt={item.name}
          className="h-[180px] w-[120px] rounded-lg object-cover md:h-[255px] md:w-[170px]"
        />
      ) : (
        <div className="h-[180px] w-[120px] rounded-lg bg-white/10 md:h-[255px] md:w-[170px]" />
      )}

      <div className="flex flex-col gap-0.5">
        <span className="text-base font-semibold">{item.name}</span>
        <span className="text-sm text-[#F2B705]">{item.characterName}</span>
      </div>
    </Link>
  );
}

export default MediaCard;
