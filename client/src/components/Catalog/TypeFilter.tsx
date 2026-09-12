import { useState } from "react";

function TypeFilter() {
  let buttonClasses = null;

  const [activeFilter, setActiveFilter] = useState("all");

  if (activeFilter === "all") {
    buttonClasses =
      "border-b-2 border-focus-yellow px-0.5 pb-3 font-semibold text-focus-yellow";
  } else {
    buttonClasses =
      "border-b-2 border-transparent px-0.5 pb-3 text-focus-muted";
  }

  return (
    <>
      <search className="flex gap-8 border-b border-white/10 mt-8">
        <button
          type="button"
          className={`${buttonClasses}`}
          onClick={() => setActiveFilter("all")}
        >
          Tous
        </button>
        <button
          type="button"
          className={`${buttonClasses}`}
          onClick={() => setActiveFilter("movies")}
        >
          Films
        </button>
        <button
          type="button"
          className={`${buttonClasses}`}
          onClick={() => setActiveFilter("tv")}
        >
          Séries
        </button>
        <button
          type="button"
          className={`${buttonClasses}`}
          onClick={() => setActiveFilter("animes")}
        >
          Animes
        </button>
      </search>
    </>
  );
}
export default TypeFilter;
