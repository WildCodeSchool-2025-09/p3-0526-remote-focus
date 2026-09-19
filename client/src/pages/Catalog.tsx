import { useSearchParams } from "react-router";
import DiscoverSection from "../components/Catalog/DiscoverSection";
import FilteredCatalog from "../components/Catalog/FilteredCatalog";
import GenreFilter from "../components/Catalog/GenreFilter";
import TypeFilter from "../components/Catalog/TypeFilter";

function Catalog() {
  const [searchParams] = useSearchParams();
  const hasGenreFilter = searchParams.get("genre") !== null;

  return (
    <>
      <h1 className="hidden">Catalogue</h1>

      <TypeFilter />
      <GenreFilter />
      {hasGenreFilter ? <FilteredCatalog /> : <DiscoverSection />}
    </>
  );
}

export default Catalog;
