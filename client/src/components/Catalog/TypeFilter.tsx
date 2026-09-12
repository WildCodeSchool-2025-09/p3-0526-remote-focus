import { useSearchParams } from "react-router";

function TypeFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get("type") ?? "all";

  function getButtonClasses(filter: string) {
    if (activeFilter === filter) {
      return "border-b-2 border-focus-yellow px-0.5 pb-3 font-semibold text-focus-yellow";
    }

    return "border-b-2 border-transparent px-0.5 pb-3 text-focus-muted";
  }

  function handleFilterChange(filter: string) {
    if (filter === "all") {
      searchParams.delete("type");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ type: filter });
    }
  }

  return (
    <>
      <search className="flex gap-8 border-b border-white/10 mt-5 pt-3 sticky top-0 bg-focus-void z-10">
        <button
          type="button"
          className={getButtonClasses("all")}
          onClick={() => handleFilterChange("all")}
        >
          Tous
        </button>
        <button
          type="button"
          className={getButtonClasses("movie")}
          onClick={() => handleFilterChange("movie")}
        >
          Films
        </button>
        <button
          type="button"
          className={getButtonClasses("tv")}
          onClick={() => handleFilterChange("tv")}
        >
          Séries
        </button>
        <button
          type="button"
          className={getButtonClasses("anime")}
          onClick={() => handleFilterChange("anime")}
        >
          Animes
        </button>
      </search>
    </>
  );
}
export default TypeFilter;
