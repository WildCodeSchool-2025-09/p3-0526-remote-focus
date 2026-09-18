import type { LucideIcon } from "lucide-react";
import { Clapperboard, Sparkles, TvMinimalPlay } from "lucide-react";
import { useEffect, useState } from "react";

import { type HomepageData, fetchHomepage } from "../../services/homepageApi";
import type { EnrichedMedia } from "../../types/Catalog";

import Carousel from "../Catalog/Carousel";
import MediaCard from "../Catalog/MediaCard";
import MediaCardLoading from "../Catalog/MediaCardLoading";

type MediaSection = {
  title: string;
  icon: LucideIcon;
  medias: EnrichedMedia[];
};

function HomeSection() {
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

  const sections: MediaSection[] = [
    {
      title: "Films",
      icon: Clapperboard,
      medias: homepageData.films,
    },
    {
      title: "Séries",
      icon: TvMinimalPlay,
      medias: homepageData.series,
    },
    {
      title: "Animés",
      icon: Sparkles,
      medias: homepageData.animes,
    },
  ];

  return (
    <main className="space-y-10">
      {sections.map(({ title, icon: Icon, medias }) => (
        <section key={title}>
          <h3 className="mt-9 mb-4 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content">
              <Icon size={20} />
            </span>
            {title}
          </h3>

          {medias.length > 0 ? (
            <Carousel>
              {medias.map((media) => (
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
      ))}
    </main>
  );
}

export default HomeSection;
