import { Link } from "react-router";
import type { Person } from "../../types/search";

type SearchActorCardProps = {
  person: Person;
};

const SearchActorCard = ({ person }: SearchActorCardProps) => {
  return (
    <Link
      to={`/actors/${person.id}`}
      className="carousel-item flex w-24 shrink-0 flex-col items-center gap-2 text-center"
    >
      {person.photo != null ? (
        <img
          src={`https://image.tmdb.org/t/p/w185${person.photo}`}
          alt={person.name}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-base-300 text-2xl">
          {person.name.charAt(0)}
        </div>
      )}
      <span className="text-sm font-medium leading-snug line-clamp-2">
        {person.name}
      </span>
    </Link>
  );
};

export default SearchActorCard;
