import { Check } from "lucide-react";
import { useWatch } from "../../contexts/WatchingContext";

interface EpisodeWatchToggleProps {
  episodeId: number;
}

function EpisodeWatchToggle({ episodeId }: EpisodeWatchToggleProps) {
  const { isEpisodeWatched, toggleWatchedEpisode } = useWatch();
  const buttonClassName =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-focus-teal";
  return (
    <button
      type="button"
      aria-label={`Marquer l'épisode comme vu`}
      className={
        isEpisodeWatched(episodeId)
          ? `${buttonClassName}  bg-focus-teal text-focus-void`
          : `${buttonClassName} text-focus-teal bg-focus-void`
      }
      onClick={() => toggleWatchedEpisode(episodeId)}
    >
      <Check size={16} strokeWidth={2} />
    </button>
  );
}

export default EpisodeWatchToggle;
