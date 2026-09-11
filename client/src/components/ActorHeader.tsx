import { Heart } from "lucide-react";
import { useActorFavorite } from "../hooks/useActorFavorite";
import type { Actor } from "../types/media";
import ActionButton from "./ActionButton";

type ActorHeaderProps = {
  actor: Actor;
};

function ActorHeader({ actor }: ActorHeaderProps) {
  const { isFavorite, handleToggleFavorite } = useActorFavorite(
    actor.id,
    actor.isFavorite,
  );

  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 md:grid-cols-[264px_minmax(0,1fr)] md:gap-8">
      {actor.photo != null ? (
        <img
          src={`https://image.tmdb.org/t/p/w500${actor.photo}`}
          alt={actor.name}
          className="col-start-1 row-start-1 h-48 w-32 rounded-lg object-cover md:h-[396px] md:w-[264px]"
        />
      ) : (
        <div className="col-start-1 row-start-1 flex h-48 w-32 items-center justify-center rounded-lg bg-white/10 text-4xl md:h-[396px] md:w-[264px]">
          {actor.name.charAt(0)}
        </div>
      )}

      <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-3 md:gap-4">
        <h1 className="text-2xl font-bold md:text-4xl">{actor.name}</h1>

        <div className="flex flex-wrap items-start gap-4">
          <ActionButton
            label="Favoris"
            color="#E83658"
            icon={Heart}
            onClick={handleToggleFavorite}
            active={isFavorite}
          />
        </div>
      </div>
    </div>
  );
}

export default ActorHeader;
