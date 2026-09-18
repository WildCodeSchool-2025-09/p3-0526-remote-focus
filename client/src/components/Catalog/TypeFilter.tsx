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
    const newSearchParams = new URLSearchParams(searchParams);
    if (filter === "all") {
      newSearchParams.delete("type");
    } else {
      newSearchParams.set("type", filter);
    }
    setSearchParams(newSearchParams);
  }

  return (
    <search className="flex flex-col gap-2 border-b md:flex-row md:gap-8 border-white/10 mt-0 pt-3 sticky top-0 bg-focus-void z-10 text-xs md:text-base">
      <div className="flex flex-col items-center md:contents">
        <button
          type="button"
          className={`${getButtonClasses("all")} max-md:!border-b-0 max-md:!pb-1`}
          onClick={() => handleFilterChange("all")}
        >
          Tous
        </button>
        <span
          className={`h-0.5 w-10 md:hidden ${
            activeFilter === "all" ? "bg-focus-yellow" : "bg-white/10"
          }`}
          aria-hidden="true"
        />
      </div>

      <div className="flex gap-8 md:contents justify-center">
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
      </div>
    </search>
  );
}
export default TypeFilter;
