import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import fetchDiscover from "../../services/catalogService";
import type { DiscoverResponse } from "../../types/Catalog";
import MediaSection from "./MediaSection";

function DiscoverSection() {
  const { token } = useAuth();
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
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(false);
  const [discover, setDiscover] = useState<DiscoverResponse>();
  useEffect(() => {
    fetchDiscover(requestedType, token ?? undefined)
      .then((data) => {
        setDiscover(data);
      })
      .catch((error) => console.log("Erreur", error));
  }, [requestedType, token]);
  return (
    <>
      {discover ? (
        <>
          <MediaSection title="Populaires" medias={discover.topRated} />
          <MediaSection title="Nouveautés" medias={discover.latest} />
          <MediaSection
            title={`${discover.genreSections[0].name}`}
            medias={discover.genreSections[0].medias}
          />
          <MediaSection
            title={`${discover.genreSections[1].name}`}
            medias={discover.genreSections[1].medias}
          />
          <MediaSection
            title={`${discover.genreSections[2].name}`}
            medias={discover.genreSections[2].medias}
          />
        </>
      ) : (
        <p>Chargement ...</p>
      )}
    </>
  );
}

export default DiscoverSection;
