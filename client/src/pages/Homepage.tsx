import { useEffect, useState } from "react";
import { Clapperboard, Sparkles, TvMinimalPlay } from "lucide-react";
import HomeMediaCard from "../components/HomeMediaCard";
import HomeMediaCardLoading from "../components/HomeMediaCardLoading";
import { fetchHomepage } from "../services/homepageApi";
import type { HomepageData } from "../types/Homepage";
import Carousel from "../components/Carousel";

function Homepage() {
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchHomepage()
      .then((data) => {
        setHomepageData(data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="space-y-10">
        {["Films", "Séries", "Animés"].map((title) => (
          <section key={title}>
            <div className="skeleton mb-4 h-8 w-40" />
            <div className="flex gap-4">
              {Array.from({ length: 6 }, (_, index) => index).map((index) => (
                <HomeMediaCardLoading key={index} />
              ))}
            </div>
          </section>
        ))}
      </main>
    );
  }

  if (error) {
    return (
      <p className="p-8 text-base-content/60">
        Une erreur est survenue lors du chargement de l'accueil. Merci
        d'actualiser la page.
      </p>
    );
  }

  if (!homepageData) {
    return null;
  }

  return (
    <main className="space-y-10">
      <Carousel
        title="Films"
        icon={<Clapperboard size={20} />}
        isEmpty={homepageData.films.length === 0}
      >
        {homepageData.films.map((media) => (
          <div key={media.id} className="carousel-item">
            <HomeMediaCard media={media} className="w-40 shrink-0" showTypeIcon={false} />
          </div>
        ))}
      </Carousel>

      <Carousel
        title="Séries"
        icon={<TvMinimalPlay size={20} />}
        isEmpty={homepageData.series.length === 0}
      >
        {homepageData.series.map((media) => (
          <div key={media.id} className="carousel-item">
            <HomeMediaCard media={media} className="w-40 shrink-0" showTypeIcon={false} />
          </div>
        ))}
      </Carousel>

      <Carousel
        title="Animés"
        icon={<Sparkles size={20} />}
        isEmpty={homepageData.animes.length === 0}
      >
        {homepageData.animes.map((media) => (
          <div key={media.id} className="carousel-item">
            <HomeMediaCard media={media} className="w-40 shrink-0" showTypeIcon={false} />
          </div>
        ))}
      </Carousel>
    </main>
  );
}

export default Homepage;
