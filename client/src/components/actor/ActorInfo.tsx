import type { Actor } from "../../types/media";
import ExpandableText from "../ExpandableText";

type ActorInfoProps = {
  actor: Actor;
};

function ActorInfo({ actor }: ActorInfoProps) {
  if (actor.biography == null) {
    return null;
  }

  return <ExpandableText text={actor.biography} />;
}

export default ActorInfo;
