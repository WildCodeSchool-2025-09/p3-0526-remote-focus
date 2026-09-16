import type { Person } from "../../types/Search";
import Carousel from "../Catalog/Carousel";
import SearchActorCard from "./SearchActorCard";

type ActorListProps = {
  actors: Person[];
};

const ActorList = ({ actors }: ActorListProps) => {
  if (actors.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <Carousel>
        {actors.map((actor) => (
          <SearchActorCard key={actor.id} person={actor} />
        ))}
      </Carousel>
    </section>
  );
};

export default ActorList;
