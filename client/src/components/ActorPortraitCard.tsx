import { Link } from "react-router";
import type { CastMember } from "../types/media";

type ActorPortraitCardProps = {
  person: CastMember;
  isSelected: boolean;
  onSelect: (personId: number) => void;
};

function ActorPortraitCard({
  person,
  isSelected,
  onSelect,
}: ActorPortraitCardProps) {
  const handleClick = () => {
    onSelect(person.id);
  };

  return (
    <div className="flex w-[104px] shrink-0 flex-col items-center gap-2 md:w-[140px]">
      <button type="button" onClick={handleClick} className="cursor-pointer">
        <div
          className="rounded-full border-[2.5px] p-1"
          style={{ borderColor: isSelected ? "#F2B705" : "transparent" }}
        >
          {person.photo != null ? (
            <img
              src={`https://image.tmdb.org/t/p/w185${person.photo}`}
              alt={person.name}
              className="h-[82px] w-[82px] rounded-full object-cover md:h-[96px] md:w-[96px]"
            />
          ) : (
            <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-white/10 text-2xl md:h-[96px] md:w-[96px]">
              {person.name.charAt(0)}
            </div>
          )}
        </div>
      </button>

      <div className="flex flex-col items-center gap-0.5 text-center">
        <Link
          to={`/actors/${person.id}`}
          className="text-base font-semibold hover:underline"
          style={{ color: isSelected ? "#F2B705" : "#F5F5F0" }}
        >
          {person.name}
        </Link>
        <span className="text-sm text-[#9FB4BD]">{person.characterName}</span>
      </div>
    </div>
  );
}

export default ActorPortraitCard;
