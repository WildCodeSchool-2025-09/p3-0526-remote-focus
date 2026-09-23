import { Link } from "react-router";
import type { ActorSummary } from "../../types/search";

type SearchActorCardProps = {
  actor: ActorSummary;
};

const SearchActorCard = ({ actor }: SearchActorCardProps) => {
  return (
    <Link
      to={`/actors/${actor.id}`}
      className="carousel-item flex w-24 shrink-0 flex-col items-center gap-2 text-center"
    >
      {actor.photo != null ? (
        <img
          src={`https://image.tmdb.org/t/p/w185${actor.photo}`}
          alt={actor.name}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-base-300 text-2xl">
          {actor.name.charAt(0)}
        </div>
      )}
      <span className="text-sm font-medium leading-snug line-clamp-2">
        {actor.name}
      </span>
    </Link>
  );
};

export default SearchActorCard;
