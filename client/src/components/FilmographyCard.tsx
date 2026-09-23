import type { KnownForMedia } from "../types/media";

type FilmographyCardProps = {
  item: KnownForMedia;
};

function FilmographyCard({ item }: FilmographyCardProps) {
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
        {item.characterNames.length === 0 ? (
          <span className="text-sm text-focus-yellow/30">
            Personnage inconnu
          </span>
        ) : (
          <span className="text-sm text-focus-yellow">
            {item.characterNames.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
export default FilmographyCard;
