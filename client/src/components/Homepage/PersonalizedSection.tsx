import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchSuggestions } from "../../services/catalogService";
import type { SuggestionsResponse } from "../../types/Catalog";
import MediaSection from "../Catalog/MediaSection";
import ActorSeenCard from "../MyActors/ActorSeenCard";

function PersonalizedSection() {
  const { token, isAuthenticated } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(
    null,
  );

  useEffect(() => {
    if (!isAuthenticated || token == null) {
      setSuggestions(null);
      return;
    }

    let active = true;

    fetchSuggestions(token)
      .then((data) => {
        if (active) {
          setSuggestions(data);
        }
      })
      .catch(() => {
        if (active) {
          setSuggestions(null);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, token]);

  if (!isAuthenticated || suggestions == null) {
    return null;
  }

  return (
    <section>
      <h2 className="mt-9 mb-4">Accueil personnalisé</h2>
      <MediaSection
        title="Basé sur vos genres préférés"
        medias={suggestions.genreBased}
      />
      <MediaSection
        title="Avec vos acteurs préférés"
        medias={suggestions.actorBased}
      />

      <h3 className="mt-9 mb-4">Vos acteurs les plus vus</h3>
      {suggestions.mostViewedActors.length === 0 ? (
        <p className="text-focus-muted-dark mb-16 mt-5">
          Ajoutez des médias à votre liste "vu" pour voir apparaître vos acteurs
          les plus vus ici.
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {suggestions.mostViewedActors.map((actor) => (
            <ActorSeenCard key={actor.id} {...actor} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PersonalizedSection;
