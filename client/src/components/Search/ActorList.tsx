import type { Person } from "../../types/Search";
import Carousel from "../Catalog/Carousel";
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
      {/*
        Nombre de cartes visibles selon le palier d'écran (w-24 = 96px + gap-4 = 16px, largeur = 112*n - 16) :
        mobile 3, sm (640px) 4, md (768px) 5, lg (1024px) 6, xl (1280px) 8 — le reste défile via le carrousel
      */}
      <div className="mx-auto max-w-[320px] sm:max-w-[432px] md:max-w-[544px] lg:max-w-[656px] xl:max-w-[880px]">
        <Carousel>
          {actors.map((actor) => (
            <SearchActorCard key={actor.id} person={actor} />
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default ActorList;
