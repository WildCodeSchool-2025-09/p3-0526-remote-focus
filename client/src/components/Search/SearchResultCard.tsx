import type { SearchMedia } from "../../types/Search";

type SearchResultCardProps = {
  media: SearchMedia;
};

function SearchResultCard({ media }: SearchResultCardProps) {
  const year = media.releasedAt
    ? new Date(media.releasedAt).getFullYear()
    : null;

  return (
    <div className="flex w-[120px] shrink-0 flex-col gap-2 md:w-[170px]">
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
        {year != null && (
          <span className="text-focus-muted-dark text-sm">{year}</span>
        )}
      </div>
    </div>
  );
}

export default SearchResultCard;
