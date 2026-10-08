import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { ProfileActor } from "../../types/ProfileActor";
import FavoriteActorCard from "./FavoriteActorCard";

type ActorSectionProps = {
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  fillIcon?: boolean;
  actors: ProfileActor[];
  children?: ReactNode;
};

function ActorSection({
  title,
  icon: Icon,
  iconClassName,
  fillIcon = false,
  actors,
  children,
}: ActorSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-lg font-bold md:text-xl">
        <Icon
          size={18}
          className={iconClassName}
          fill={fillIcon ? "currentColor" : "none"}
          aria-hidden="true"
        />
        {title}
      </h2>

      {actors.length > 0 && (
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
          {actors.map((actor) => (
            <FavoriteActorCard key={actor.id} actor={actor} />
          ))}
        </div>
      )}

      {children}
    </section>
  );
}

export default ActorSection;
