import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchSuggestions } from "../../services/catalogService";
import type { SuggestionsResponse } from "../../types/Catalog";
import MediaSection from "../Catalog/MediaSection";

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
    </section>
  );
}

export default PersonalizedSection;
