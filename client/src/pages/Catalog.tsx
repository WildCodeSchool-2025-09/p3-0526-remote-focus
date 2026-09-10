import { useEffect, useState } from "react";
import fetchDiscover from "../services/catalogService";
import type { DiscoverResponse } from "../types/Catalog";
import { useSearchParams } from "react-router";
import Carousel from "../components/Carousel";

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
      {discover ? <p>{discover.latest[0].ID}</p> : <p>Chargement ...</p>}
      <Carousel>
        <div className="catalog-carousel-item">Carte 1</div>
        <div className="catalog-carousel-item">Carte 2</div>
        <div className="catalog-carousel-item">Carte 3</div>
        <div className="catalog-carousel-item">Carte 4</div>
        <div className="catalog-carousel-item">Carte 5</div>
        <div className="catalog-carousel-item">Carte 6</div>
        <div className="catalog-carousel-item">Carte 1</div>
        <div className="catalog-carousel-item">Carte 2</div>
        <div className="catalog-carousel-item">Carte 3</div>
        <div className="catalog-carousel-item">Carte 4</div>
        <div className="catalog-carousel-item">Carte 5</div>
        <div className="catalog-carousel-item">Carte 6</div>
      </Carousel>
    </>
  );
}

export default Catalog;
