import { Clapperboard, Sparkles, TvMinimalPlay } from "lucide-react";
import { useEffect, useState } from "react";
import Carousel from "../components/Catalog/Carousel";
import MediaCard from "../components/Catalog/MediaCard";
import MediaCardLoading from "../components/Catalog/MediaCardLoading";
import { type HomepageData, fetchHomepage } from "../services/homepageApi";

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
            <h3 className="mt-9 mb-4">{title}</h3>
            <div className="carousel flex">
              {Array.from({ length: 6 }, (_, index) => index).map((index) => (
                <MediaCardLoading key={index} />
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
      <section>
        <h3 className="mt-9 mb-4 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content">
            <Clapperboard size={20} />
          </span>
          Films
        </h3>
        {homepageData.films.length > 0 ? (
          <Carousel>
            {homepageData.films.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                showTypeIcon={false}
                className="catalog-carousel-item"
              />
            ))}
          </Carousel>
        ) : (
          <p className="mt-5 mb-16">Aucun média à afficher</p>
        )}
      </section>

      <section>
        <h3 className="mt-9 mb-4 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content">
            <TvMinimalPlay size={20} />
          </span>
          Séries
        </h3>
        {homepageData.series.length > 0 ? (
          <Carousel>
            {homepageData.series.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                showTypeIcon={false}
                className="catalog-carousel-item"
              />
            ))}
          </Carousel>
        ) : (
          <p className="mt-5 mb-16">Aucun média à afficher</p>
        )}
      </section>

      <section>
        <h3 className="mt-9 mb-4 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content">
            <Sparkles size={20} />
          </span>
          Animés
        </h3>
        {homepageData.animes.length > 0 ? (
          <Carousel>
            {homepageData.animes.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                showTypeIcon={false}
                className="catalog-carousel-item"
              />
            ))}
          </Carousel>
        ) : (
          <p className="mt-5 mb-16">Aucun média à afficher</p>
        )}
      </section>
    </main>
  );
}

export default Homepage;
