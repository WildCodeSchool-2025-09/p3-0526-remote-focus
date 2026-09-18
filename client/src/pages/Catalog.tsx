import DiscoverSection from "../components/Catalog/DiscoverSection";
import GenreFilter from "../components/Catalog/GenreFilter";
import TypeFilter from "../components/Catalog/TypeFilter";

function Catalog() {
  return (
    <>
      <h1>Catalogue</h1>

      <TypeFilter />
      <GenreFilter />
      <DiscoverSection />
    </>
  );
}

export default Catalog;
