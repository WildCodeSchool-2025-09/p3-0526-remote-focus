import type { Format } from "../../types/Catalog";
import type { Genre } from "../../types/media";

type FilterBarProps = {
  genres: Genre[];
  selectedFormat: Format;
  selectedGenres: number[];
  onFormatChange: (format: Format) => void;
  onGenreToggle: (genreId: number) => void;
  onResetGenres: () => void;
};

const FORMAT_TABS: { label: string; value: Format }[] = [
  { label: "Tous", value: null },
  { label: "Films", value: "movie" },
  { label: "Séries", value: "tv" },
  { label: "Animés", value: "anime" },
];

function FilterBar({
  genres,
  selectedFormat,
  selectedGenres,
  onFormatChange,
  onGenreToggle,
  onResetGenres,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="tabs tabs-boxed w-fit">
        {FORMAT_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`tab ${selectedFormat === tab.value ? "tab-active" : ""}`}
            onClick={() => onFormatChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.id);

          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => onGenreToggle(genre.id)}
              className={
                isSelected
                  ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-base-100"
                  : "rounded-full border border-base-content/30 px-4 py-2 text-sm"
              }
            >
              {genre.name}
            </button>
          );
        })}

        {selectedGenres.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onResetGenres}
          >
            Retour à la découverte
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
