import { Heart } from "lucide-react";
import type { Actor } from "../../types/media";
import ActionButton from "../ActionButton";
import ActorInfo from "./ActorInfo";

type ActorHeaderProps = {
  actor: Actor;
};

function ActorHeader({ actor }: ActorHeaderProps) {
  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 md:grid-cols-[264px_minmax(0,1fr)] md:gap-8">
      {actor.photo != null ? (
        <img
          src={`https://image.tmdb.org/t/p/w500${actor.photo}`}
          alt={actor.name}
          className="h-48 w-32 rounded-lg object-cover md:h-[396px] md:w-[264px]"
        />
      ) : (
        <div className="h-48 w-32 rounded-lg bg-white/10 md:h-[396px] md:w-[264px]" />
      )}

      <div className="flex min-w-0 flex-col gap-4 md:gap-6">
        <h1 className="text-2xl font-bold md:text-4xl">{actor.name}</h1>

        <ActorInfo actor={actor} />

        <ActionButton
          label="Favoris"
          color="#E83658"
          icon={Heart}
          align="start"
        />
      </div>
    </div>
  );
}

export default ActorHeader;
