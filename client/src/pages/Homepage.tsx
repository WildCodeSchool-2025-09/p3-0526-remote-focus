import { useEffect, useState } from "react";
import MediaSection from "../components/Catalog/MediaSection";
import { useAuth } from "../contexts/AuthContext";
import { fetchHomepage } from "../services/catalogService";
import type { HomepageResponse } from "../types/Catalog";

function Homepage() {
  const { token } = useAuth();
  const [homepage, setHomepage] = useState<HomepageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    fetchHomepage(token ?? undefined)
      .then((data) => {
        if (active) {
          setHomepage(data);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (loading) {
    return <span className="loading loading-spinner text-primary mt-8" />;
  }

  if (error || homepage == null) {
    return (
      <p className="text-error mt-8">
        Impossible de charger la page d'accueil, réessayez plus tard.
      </p>
    );
  }

  return (
    <div>
      <h1>Accueil</h1>

      <MediaSection title="Nouveautés" medias={homepage.newReleases} />
      <MediaSection title="Populaires" medias={homepage.popular} />
      <MediaSection title="Films" medias={homepage.movies} />
      <MediaSection title="Séries" medias={homepage.series} />
      <MediaSection title="Animés" medias={homepage.animes} />
    </div>
  );
}

export default Homepage;
