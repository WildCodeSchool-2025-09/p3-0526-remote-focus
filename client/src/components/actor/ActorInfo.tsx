import type { PersonDetail } from "../../types/media";

type ActorInfoProps = {
  person: PersonDetail;
};

function ActorInfo({ person }: ActorInfoProps) {
  if (person.biography == null) {
    return null;
  }

  return (
    <p className="max-w-[660px] text-base leading-relaxed text-[#C9D6DB]">
      {person.biography}
    </p>
  );
}

export default ActorInfo;
