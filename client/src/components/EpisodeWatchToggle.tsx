import { Check } from "lucide-react";
import type { MouseEvent } from "react";
import { useWatchedStatus } from "../hooks/useWatchedStatus";

type EpisodeWatchToggleProps = {
  episodeId: number;
  initialIsWatched?: boolean;
};

function EpisodeWatchToggle({
  episodeId,
  initialIsWatched = false,
}: EpisodeWatchToggleProps) {
  const { isWatched, handleToggleWatched } = useWatchedStatus(
    "episode",
    episodeId,
    initialIsWatched,
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleToggleWatched();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isWatched ? "Marquer comme non vu" : "Marquer comme vu"}
      aria-pressed={isWatched}
      className="pointer-events-none flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border-2 md:pointer-events-auto"
      style={{
        borderColor: "#17B890",
        backgroundColor: isWatched ? "#17B890" : "transparent",
        color: isWatched ? "#0D1117" : "#17B890",
      }}
    >
      <Check size={16} strokeWidth={2} />
    </button>
  );
}

export default EpisodeWatchToggle;
