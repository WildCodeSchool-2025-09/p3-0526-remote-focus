import type { FilmographyItem } from "../types/media";

type MediaCardProps = {
  item: FilmographyItem;
};

function MediaCard({ item }: MediaCardProps) {
  return (
    <div className="flex w-[120px] shrink-0 flex-col gap-2 md:w-[170px]">
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
    </div>
  );
}

export default MediaCard;
