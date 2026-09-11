import { useEffect, useState } from "react";

import { fetchHomepage } from "../services/homepageApi";
import type { HomepageData } from "../types/homepage";

function Homepage() {
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);

  useEffect(() => {
    fetchHomepage()
      .then((data) => {
        console.log(data);
        setHomepageData(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <main>
      <h1>Accueil</h1>

      {homepageData && (
        <>
          <p>Films : {homepageData.films.length}</p>
          <p>Séries : {homepageData.series.length}</p>
          <p>Animés : {homepageData.animes.length}</p>
        </>
      )}
    </main>
  );
}

export default Homepage;
