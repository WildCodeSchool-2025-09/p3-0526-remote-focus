import { Link } from "react-router";
import type { Season } from "../types/media";

type SeasonListProps = {
  seriesId: number;
  seasons: Season[];
};

function SeasonList({ seriesId, seasons }: SeasonListProps) {
  if (seasons.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold md:text-2xl">Saisons</h2>

      <div className="flex flex-col gap-3">
        {seasons.map((season) => (
          <Link
            key={season.id}
            to={`/series/${seriesId}/seasons/${season.id}`}
            className="flex items-center gap-4 rounded-lg border border-white/10 bg-[#0F242F] p-3 hover:border-white/30"
          >
            {season.poster != null ? (
              <img
                src={`https://image.tmdb.org/t/p/w154${season.poster}`}
                alt={season.name ?? `Saison ${season.number}`}
                className="h-20 w-14 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-20 w-14 shrink-0 rounded bg-white/10" />
            )}

            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                {season.name ?? `Saison ${season.number}`}
              </span>
              <span className="text-sm text-[#9FB4BD]">
                {season.episodeCount} épisode
                {season.episodeCount > 1 ? "s" : ""}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default SeasonList;
