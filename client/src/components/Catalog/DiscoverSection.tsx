import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import fetchDiscover from "../../services/catalogService";
import type { DiscoverResponse } from "../../types/Catalog";
import MediaSection from "./MediaSection";
import MediaCardLoading from "./MediaCardLoading";

function DiscoverSection() {
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");

  const requestedType =
    type === "movie"
      ? type
      : type === "tv"
        ? type
        : type === "anime"
          ? type
          : undefined;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [discover, setDiscover] = useState<DiscoverResponse>();

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setDiscover(undefined);
    fetchDiscover(requestedType)
      .then((data) => {
        setDiscover(data);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement du catalogue :", error);
        setError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [requestedType]);

  if (isLoading) {
    return (
      <>
        <div className="skeleton h-8 w-48 mt-12 ml-4 mr-8" />
        <div className="carousel flex">
          {Array.from({ length: 10 }, (_, index) => index + 1).map(
            (loadingId) => (
              <MediaCardLoading key={loadingId} />
            ),
          )}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <p className="m-12">
        Une erreur est survenue lors du chargement du catalogue. Merci
        d'actualiser la page.
      </p>
    );
  }

  if (!discover) {
    return null;
  }

  return (
    <>
      <>
        <MediaSection
          title="Populaires"
          medias={discover.topRated}
          searchParams={requestedType}
        />
        <MediaSection
          title="Nouveautés"
          medias={discover.latest}
          searchParams={requestedType}
        />
        <MediaSection
          title={`${discover.genreSections[0].name}`}
          medias={discover.genreSections[0].medias}
          searchParams={requestedType}
          genreId={discover.genreSections[0].id}
        />
        <MediaSection
          title={`${discover.genreSections[1].name}`}
          medias={discover.genreSections[1].medias}
          searchParams={requestedType}
          genreId={discover.genreSections[1].id}
        />
        <MediaSection
          title={`${discover.genreSections[2].name}`}
          medias={discover.genreSections[2].medias}
          searchParams={requestedType}
          genreId={discover.genreSections[2].id}
        />
      </>
    </>
  );
}

export default DiscoverSection;
