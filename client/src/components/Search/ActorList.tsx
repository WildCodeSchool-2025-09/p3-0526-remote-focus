import type { Person } from "../../types/Search";
import SearchActorCard from "./SearchActorCard";

type ActorListProps = {
  title: string;
  actors: Person[];
};

const ActorList = ({ title, actors }: ActorListProps) => {
  if (actors.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2>{title}</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
        {actors.map((actor) => (
          <SearchActorCard key={actor.id} person={actor} />
        ))}
      </div>
    </section>
  );
};

export default ActorList;
