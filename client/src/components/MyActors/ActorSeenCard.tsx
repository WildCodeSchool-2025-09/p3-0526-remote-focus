import { Link } from "react-router";

type ActorSeenCardProps = {
  id: number;
  name: string;
  photo: string | null;
  seenCount: number;
};

function ActorSeenCard({ id, name, photo, seenCount }: ActorSeenCardProps) {
  return (
    <Link
      to={`/actors/${id}`}
      className="flex w-[104px] shrink-0 flex-col items-center gap-2 text-center md:w-[140px]"
    >
      {photo != null ? (
        <img
          src={`https://image.tmdb.org/t/p/w185${photo}`}
          alt={name}
          className="h-[82px] w-[82px] rounded-full object-cover md:h-[96px] md:w-[96px]"
        />
      ) : (
        <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-white/10 text-2xl md:h-[96px] md:w-[96px]">
          {name.charAt(0)}
        </div>
      )}

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-base font-semibold">{name}</span>
        <span className="text-focus-muted-dark text-sm">
          {seenCount} {seenCount > 1 ? "titres vus" : "titre vu"}
        </span>
      </div>
    </Link>
  );
}

export default ActorSeenCard;
