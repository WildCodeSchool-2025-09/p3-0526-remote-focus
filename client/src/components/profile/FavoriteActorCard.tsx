import { Link } from "react-router";
import type { ProfileActor } from "../../types/ProfileActor";

type FavoriteActorCardProps = {
  actor: ProfileActor;
};

function FavoriteActorCard({ actor }: FavoriteActorCardProps) {
  const viewedLabel =
    actor.viewedCount > 1
      ? `${actor.viewedCount} titres vus`
      : `${actor.viewedCount} titre vu`;

  return (
    <Link
      to={`/actors/${actor.id}`}
      className="group flex flex-col items-center gap-2 text-center"
    >
      {actor.photo != null ? (
        <img
          src={`https://image.tmdb.org/t/p/w185${actor.photo}`}
          alt=""
          className="h-20 w-20 rounded-full border-2 border-transparent object-cover transition-colors group-hover:border-primary md:h-24 md:w-24"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-transparent bg-base-content/10 text-2xl transition-colors group-hover:border-primary md:h-24 md:w-24">
          {actor.name.charAt(0)}
        </div>
      )}

      <span className="text-sm font-semibold transition-colors group-hover:text-primary">
        {actor.name}
      </span>
      <span className="text-xs text-focus-muted">{viewedLabel}</span>
    </Link>
  );
}

export default FavoriteActorCard;
