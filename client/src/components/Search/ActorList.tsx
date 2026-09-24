import type { ActorSummary } from "../../types/search";
import Carousel from "../Catalog/Carousel";
import SearchActorCard from "./SearchActorCard";

type ActorListProps = {
  actors: ActorSummary[];
};

const ActorList = ({ actors }: ActorListProps) => {
  if (actors.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <Carousel>
        {actors.map((actor) => (
          <SearchActorCard key={actor.id} actor={actor} />
        ))}
      </Carousel>
    </section>
  );
};

export default ActorList;
