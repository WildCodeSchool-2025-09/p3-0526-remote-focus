import { Clapperboard, Sparkles, TvMinimalPlay } from "lucide-react";
import { Link } from "react-router";
import type { KnownForMedia } from "../types/media";

type FilmographyCardProps = {
  item: KnownForMedia;
  onNavigate: () => void;
};

function FilmographyCard({ item, onNavigate }: FilmographyCardProps) {
  let urlDetails = null;

  if (item.type === "movie") {
    urlDetails = "movies";
  } else if (item.isAnime) {
    urlDetails = "animes";
  } else if (item.type === "tv") {
    urlDetails = "series";
  }
  const linkTo = urlDetails ? `/${urlDetails}/${item.id}` : "/catalogue";

  let mediaIcon = null;

  if (item.type === "movie") {
    mediaIcon = <Clapperboard size={20} />;
  } else if (item.isAnime) {
    mediaIcon = <Sparkles size={20} />;
  } else if (item.type === "tv") {
    mediaIcon = <TvMinimalPlay size={20} />;
  }

  return (
    <Link to={linkTo} onClick={onNavigate}>
      <div className="flex w-[120px] shrink-0 flex-col gap-2 md:w-[170px]">
        <div className="relative">
          {item.poster != null ? (
            <img
              src={`https://image.tmdb.org/t/p/w342${item.poster}`}
              alt={item.name}
              className="h-[180px] w-[120px] rounded-lg object-cover md:h-[255px] md:w-[170px]"
            />
          ) : (
            <div className="h-[180px] w-[120px] rounded-lg bg-white/10 md:h-[255px] md:w-[170px]" />
          )}
          {mediaIcon && (
            <span
              className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full badge-primary shadow-badge"
              title={`${urlDetails}`}
            >
              {mediaIcon}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <span
            className="line-clamp-2 min-h-12 content-center font-display font-semibold text-base"
            title={`${item.name}`}
          >
            {item.name}
          </span>
          {item.characterNames.length === 0 ? (
            <span className="text-sm text-focus-yellow/30">
              Personnage inconnu
            </span>
          ) : (
            <span className="text-sm text-focus-yellow">
              {item.characterNames.slice(0, 2).join(", ")}
              {item.characterNames.length > 2 &&
                ` + ${item.characterNames.length - 2} autres`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
export default FilmographyCard;
