import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { fetchDiscover } from "../../services/catalogService";
import type { DiscoverResponse } from "../../types/Catalog";
import MediaCardLoading from "./MediaCardLoading";
import MediaSection from "./MediaSection";
import { isValidMediaType } from "../../hooks/catalogUtils";

function DiscoverSection() {
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");

  const requestedType = type && isValidMediaType(type) ? type : undefined;

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
      <MediaSection
        title="Populaires"
        medias={discover.topRated}
        showTypeIcon={!requestedType}
        showGenre={true}
      />
      <MediaSection
        title="Nouveautés"
        medias={discover.latest}
        showTypeIcon={!requestedType}
        showGenre={true}
      />
      {discover.genreSections.map((genre) => (
        <MediaSection
          key={genre.id}
          title={genre.name}
          medias={genre.medias}
          showTypeIcon={!requestedType}
          showGenre={false}
          genreId={genre.id}
        />
      ))}
    </>
  );
}

export default DiscoverSection;
