import type { Episode } from "../types/media";
import { formatDuration } from "../utils/formatDuration";

type EpisodeDetailListProps = {
  episodes: Episode[];
  fallbackPoster: string | null;
};

function EpisodeDetailList({
  episodes,
  fallbackPoster,
}: EpisodeDetailListProps) {
  if (episodes.length === 0) {
    return <p className="text-sm text-[#9FB4BD]">Aucun épisode disponible.</p>;
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold md:text-2xl">Épisodes</h2>

      <div className="flex flex-col gap-3">
        {episodes.map((episode) => {
          const meta = [
            episode.releasedAt
              ? new Date(episode.releasedAt).toLocaleDateString("fr-FR")
              : null,
            episode.duration != null ? formatDuration(episode.duration) : null,
          ]
            .filter((value) => value != null)
            .join(" · ");

          return (
            <div
              key={episode.id}
              className="flex gap-4 rounded-lg border border-white/10 bg-[#0F242F] p-3"
            >
              {fallbackPoster != null ? (
                <img
                  src={`https://image.tmdb.org/t/p/w154${fallbackPoster}`}
                  alt={episode.name ?? `Épisode ${episode.number}`}
                  className="h-20 w-14 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="h-20 w-14 shrink-0 rounded bg-white/10" />
              )}

              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-semibold">
                  {episode.number != null ? `${episode.number}. ` : ""}
                  {episode.name ?? `Épisode ${episode.number}`}
                </span>
                {meta.length > 0 && (
                  <span className="text-sm text-[#9FB4BD]">{meta}</span>
                )}
                {episode.synopsis != null && (
                  <p className="line-clamp-2 text-sm text-[#C9D6DB]">
                    {episode.synopsis}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default EpisodeDetailList;
