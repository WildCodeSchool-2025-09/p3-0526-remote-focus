import { useNavigate } from "react-router";
import useFetch from "../../hooks/useFetch";
import type { CastMember } from "../../types/media";
import ActorPortraitCard from "../ActorPortraitCard";
import Carousel from "../Catalog/Carousel";

function MostWatchedActorsSection() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch<{ actors: CastMember[] }>(
    "/api/me/actors/most-watched",
  );

  if (loading || error || !data) {
    return null;
  }

  return (
    <section>
      <h3 className="mt-9 mb-4">Vos comédiens les plus vus</h3>

      {data.actors.length > 0 ? (
        <Carousel>
          {data.actors.map((actor) => (
            <ActorPortraitCard
              key={actor.id}
              person={actor}
              isSelected={false}
              onSelect={(personId) => navigate(`/actors/${personId}`)}
            />
          ))}
        </Carousel>
      ) : (
        <p className="mt-5 mb-16 rounded-box bg-base-200 px-5 py-4 text-sm text-focus-teal">
          Ajoutez des médias à votre liste de « vus » pour découvrir vos
          comédiens les plus vus.
        </p>
      )}
    </section>
  );
}

export default MostWatchedActorsSection;
