import type { GenreCount } from "../../types/Statistics";
import { getGenreColor } from "../../utils/genreColors";

type TopGenresListProps = {
  data: GenreCount[];
};

function TopGenresList({ data }: TopGenresListProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-focus-muted">
        Aucune donnée de genre pour l'instant.
      </p>
    );
  }

  const maxCount = Math.max(...data.map((entry) => entry.count));

  return (
    <ul className="flex flex-col gap-3">
      {data.map((entry, index) => (
        <li
          key={entry.genre}
          className="flex items-center gap-4 text-sm sm:text-base"
        >
          <span className="w-24 shrink-0 sm:w-32">{entry.genre}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-base-300">
            <span
              className="block h-full rounded-full"
              style={{
                width: `${(entry.count / maxCount) * 100}%`,
                backgroundColor: getGenreColor(entry.genre, index),
              }}
            />
          </span>
          <span className="w-20 shrink-0 text-right font-semibold">
            {entry.count} titre{entry.count > 1 ? "s" : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default TopGenresList;
