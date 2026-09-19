import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Season } from "../../types/media";
import EpisodeList from "./EpisodeList";

type SeasonListProps = {
  seasons: Season[];
};

function SeasonList({ seasons }: SeasonListProps) {
  const [openSeasonId, setOpenSeasonId] = useState<number | null>(null);

  if (seasons.length === 0) {
    return null;
  }

  const handleToggleSeason = (seasonId: number) => {
    setOpenSeasonId(openSeasonId === seasonId ? null : seasonId);
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold md:text-2xl">Saisons</h2>

      <div className="flex flex-col gap-3">
        {seasons.map((season) => {
          const isOpen = season.id === openSeasonId;

          return (
            <div
              key={season.id}
              className="overflow-hidden rounded-xl border"
              style={{
                borderColor: isOpen ? "#F2B705" : "rgba(255,255,255,0.15)",
              }}
            >
              <button
                type="button"
                onClick={() => handleToggleSeason(season.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left md:px-6"
                style={{ color: isOpen ? "#F2B705" : "#F5F5F0" }}
              >
                <span className="font-semibold">
                  Saison {season.number} - {season.episodeCount} épisode
                  {season.episodeCount > 1 ? "s" : ""}
                  {!season.isFinished && " (en cours)"}
                </span>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isOpen && <EpisodeList seasonId={season.id} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SeasonList;
