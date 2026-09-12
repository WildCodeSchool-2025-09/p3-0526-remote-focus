import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { fetchSeason } from "../services/api";
import type { Episode, Season } from "../types/media";
import { formatDuration } from "../utils/formatDuration";
import EpisodeWatchToggle from "./EpisodeWatchToggle";

type SeasonAccordionRowProps = {
  seriesId: number;
  season: Season;
  isExpanded: boolean;
  onToggle: () => void;
};

function SeasonAccordionRow({
  seriesId,
  season,
  isExpanded,
  onToggle,
}: SeasonAccordionRowProps) {
  const { token } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when expanded toggles, not when the fetched episodes are written
  useEffect(() => {
    if (!isExpanded || episodes != null) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(false);

    fetchSeason(seriesId, season.id, token ?? undefined)
      .then((data) => {
        if (active) {
          setEpisodes(data.episodes);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isExpanded, seriesId, season.id, token]);

  const seasonLabel = season.name ?? `Saison ${season.number}`;

  return (
    <div className="rounded-lg border border-white/10 bg-[#0F242F]">
      <div className="flex items-center gap-3 p-3">
        <Link
          to={`/series/${seriesId}/seasons/${season.id}`}
          className="flex min-w-0 flex-1 items-center gap-4 hover:opacity-80"
        >
          {season.poster != null ? (
            <img
              src={`https://image.tmdb.org/t/p/w154${season.poster}`}
              alt={seasonLabel}
              className="h-16 w-11 shrink-0 rounded object-cover"
            />
          ) : (
            <div className="h-16 w-11 shrink-0 rounded bg-white/10" />
          )}

          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate font-semibold">{seasonLabel}</span>
            <span className="text-sm text-[#9FB4BD]">
              {season.episodeCount} épisode
              {season.episodeCount > 1 ? "s" : ""}
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Réduire la saison" : "Déplier la saison"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#9FB4BD] hover:text-[#F5F5F0]"
        >
          <ChevronDown
            size={20}
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="max-h-[420px] overflow-y-auto border-t border-white/10 p-2">
          {loading && (
            <span className="loading loading-spinner loading-sm text-primary m-2" />
          )}

          {!loading && error && (
            <p className="p-2 text-sm text-[#9FB4BD]">
              Impossible de charger les épisodes.
            </p>
          )}

          {!loading &&
            !error &&
            episodes?.map((episode) => {
              const meta = [
                episode.duration != null
                  ? formatDuration(episode.duration)
                  : null,
              ]
                .filter((value) => value != null)
                .join(" · ");

              return (
                <Link
                  key={episode.id}
                  to={`/series/${seriesId}/seasons/${season.id}/episodes/${episode.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5"
                >
                  <span className="w-6 shrink-0 text-sm text-[#9FB4BD]">
                    {episode.number}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {episode.name ?? `Épisode ${episode.number}`}
                  </span>
                  {meta.length > 0 && (
                    <span className="shrink-0 text-xs text-[#9FB4BD]">
                      {meta}
                    </span>
                  )}
                  <EpisodeWatchToggle
                    episodeId={episode.id}
                    initialIsWatched={episode.isWatched}
                  />
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}

type SeasonAccordionProps = {
  seriesId: number;
  seasons: Season[];
};

function SeasonAccordion({ seriesId, seasons }: SeasonAccordionProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (seasons.length === 0) {
    return null;
  }

  const toggleExpand = (seasonId: number) => {
    setExpandedId((current) => (current === seasonId ? null : seasonId));
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold md:text-2xl">Saisons</h2>

      <div className="flex flex-col gap-3">
        {seasons.map((season) => (
          <SeasonAccordionRow
            key={season.id}
            seriesId={seriesId}
            season={season}
            isExpanded={expandedId === season.id}
            onToggle={() => toggleExpand(season.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default SeasonAccordion;
