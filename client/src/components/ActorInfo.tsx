import type { Actor } from "../types/media";

type ActorInfoProps = {
  actor: Actor;
};

function ActorInfo({ actor }: ActorInfoProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold md:text-2xl">Biographie</h2>
      <p className="max-w-[660px] text-base leading-relaxed text-[#C9D6DB]">
        {actor.biography ?? "Non renseigné"}
      </p>
    </div>
  );
}

export default ActorInfo;
