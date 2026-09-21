import { ChevronDown } from "lucide-react";
import { useState } from "react";

import type { Genre } from "../../services/genreApi";

interface GenreSelectorProps {
  genres: Genre[];
  selectedGenreIds: number[];
  onToggle: (genreId: number) => void;
}

const VISIBLE_GENRE_COUNT = 6;

function GenreSelector({
  genres,
  selectedGenreIds,
  onToggle,
}: GenreSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleGenres = genres.slice(0, VISIBLE_GENRE_COUNT);
  const additionalGenres = genres.slice(VISIBLE_GENRE_COUNT);

  const renderGenreButton = (genre: Genre) => {
    const isSelected = selectedGenreIds.includes(genre.id);

    return (
      <button
        key={genre.id}
        type="button"
        aria-pressed={isSelected}
        onClick={() => onToggle(genre.id)}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
          isSelected
            ? "border-warning bg-warning text-warning-content"
            : "border-cyan-900 text-base-content/70 hover:border-warning hover:text-warning"
        }`}
      >
        {genre.name}
      </button>
    );
  };

  return (
    <fieldset className="border-t border-base-content/10 pt-4">
      <legend className="mb-3 w-full pt-4 text-sm font-semibold text-base-content">
        Genres que vous appréciez
        <span className="ml-2 text-xs font-normal text-base-content/50">
          {selectedGenreIds.length} sélectionné(s)
        </span>
      </legend>

      <div className="flex flex-wrap gap-2">
        {visibleGenres.map(renderGenreButton)}
      </div>

      {additionalGenres.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls="additional-genres"
            onClick={() => setIsExpanded((currentValue) => !currentValue)}
            className="flex items-center gap-1 text-xs font-medium text-base-content/60 transition hover:text-warning"
          >
            {isExpanded
              ? "Afficher moins"
              : `Afficher ${additionalGenres.length} autres genres`}

            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {isExpanded && (
            <div
              id="additional-genres"
              className="mt-3 flex flex-wrap gap-2 rounded-md bg-base-300/50 p-3"
            >
              {additionalGenres.map(renderGenreButton)}
            </div>
          )}
        </div>
      )}
    </fieldset>
  );
}

export default GenreSelector;
