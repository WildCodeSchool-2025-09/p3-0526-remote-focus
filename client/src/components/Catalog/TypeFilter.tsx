import { Clapperboard, Sparkles, TvMinimalPlay } from "lucide-react";
import { useSearchParams } from "react-router";

function TypeFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get("type") ?? "all";

  function getButtonClasses(filter: string) {
    if (activeFilter === filter) {
      return "border-b-2 border-focus-yellow px-0.5 pb-3 font-semibold text-focus-yellow flex gap-2 items-center";
    }
    return "border-b-2 border-transparent px-0.5 pb-3 text-focus-muted flex gap-2 items-center";
  }

  function getIconColor(filter: string) {
    if (activeFilter === filter) {
      return "#F2B705";
    }
    return "#9FB4BD";
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
        <Clapperboard color={getIconColor("movie")} size={20} />
        Films
      </button>
      <button
        type="button"
        className={getButtonClasses("tv")}
        onClick={() => handleFilterChange("tv")}
      >
        <TvMinimalPlay color={getIconColor("tv")} size={20} />
        Séries
      </button>
      <button
        type="button"
        className={getButtonClasses("anime")}
        onClick={() => handleFilterChange("anime")}
      >
        <Sparkles color={getIconColor("anime")} size={20} />
        Animes
      </button>
    </search>
  );
}
export default TypeFilter;
