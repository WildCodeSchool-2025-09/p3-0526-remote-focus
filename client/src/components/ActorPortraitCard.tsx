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
    <button
      type="button"
      onClick={handleClick}
      className="flex w-[104px] shrink-0 cursor-pointer flex-col items-center gap-2 md:w-[140px]"
    >
      <div
        className={`rounded-full border-[2.5px] p-1 ${
          isSelected ? "border-primary" : "border-transparent"
        }`}
      >
        {person.photo != null ? (
          <img
            src={`https://image.tmdb.org/t/p/w185${person.photo}`}
            alt={person.name}
            className="h-[82px] w-[82px] rounded-full object-cover md:h-[96px] md:w-[96px]"
          />
        ) : (
          <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-base-content/10 text-2xl md:h-[96px] md:w-[96px]">
            {person.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5 text-center">
        <span
          className={`text-base font-semibold ${
            isSelected ? "text-primary" : "text-base-content"
          }`}
        >
          {person.name}
        </span>
        <span className="text-sm text-focus-muted">{person.characterName}</span>
      </div>
    </button>
  );
}

export default ActorPortraitCard;
