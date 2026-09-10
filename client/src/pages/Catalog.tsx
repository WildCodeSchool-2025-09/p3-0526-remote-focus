import { useEffect, useState } from "react";
import fetchDiscover from "../services/catalogService";
import type { DiscoverResponse } from "../types/Catalog";
import { useSearchParams } from "react-router";
import Carousel from "../components/Carousel";
import MediaCard from "../components/MediaCard";

function Catalog() {
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
    fetchDiscover(requestedType)
      .then((data) => {
        setDiscover(data);
      })
      .catch((error) => console.log("Erreur", error));
  }, [requestedType]);
  return (
    <>
      <h1>Catalogue</h1>
      {console.log(discover)}
      <h2>Populaires</h2>
      {discover ? (
        <Carousel>
          {discover?.topRated.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              className="catalog-carousel-item"
            />
          ))}
        </Carousel>
      ) : (
        <p>Chargement ...</p>
      )}
      <h2>Nouveautés</h2>
      {discover ? (
        <Carousel>
          {discover?.topRated.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              className="catalog-carousel-item"
            />
          ))}
        </Carousel>
      ) : (
        <p>Chargement ...</p>
      )}
    </>
  );
}

export default Catalog;
