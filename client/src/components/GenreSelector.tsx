import type { Genre } from "../types/media";

type GenreSelectorProps = {
  genres: Genre[];
  selectedGenres: number[];
  onToggle: (genreId: number) => void;
};

function GenreSelector({
  genres,
  selectedGenres,
  onToggle,
}: GenreSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((genre) => {
        const isSelected = selectedGenres.includes(genre.id);

        return (
          <button
            key={genre.id}
            type="button"
            onClick={() => onToggle(genre.id)}
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
    </div>
  );
}

export default GenreSelector;
