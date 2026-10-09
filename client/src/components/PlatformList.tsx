import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Platform } from "../types/media";

const VISIBLE_PLATFORMS = 4;

type PlatformListProps = {
  platforms: Platform[];
};

function PlatformList({ platforms }: PlatformListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (platforms.length === 0) {
    return null;
  }

  const isTruncatable = platforms.length > VISIBLE_PLATFORMS;
  const displayedPlatforms =
    isExpanded || !isTruncatable
      ? platforms
      : platforms.slice(0, VISIBLE_PLATFORMS);

  const handleToggle = () => {
    setIsExpanded((previous) => !previous);
  };

  return (
    <>
      <div className="hidden h-12 w-px bg-base-content/15 md:block" />
      <div className="flex w-full flex-col items-start md:w-auto">
        <div className="flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-base-content/15 bg-base-200 p-2">
          {displayedPlatforms.map((platform) => (
            <img
              key={platform.id}
              src={`https://image.tmdb.org/t/p/w92${platform.logo}`}
              alt={platform.name}
              title={platform.name}
              className="h-8 w-8 rounded object-contain"
            />
          ))}
        </div>

        {isTruncatable && (
          <button
            type="button"
            onClick={handleToggle}
            aria-expanded={isExpanded}
            className="mt-2 flex items-center gap-1 text-sm font-medium text-primary"
          >
            {isExpanded ? "Réduire" : "Voir la suite"}
            <ChevronDown
              size={16}
              className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    </>
  );
}

export default PlatformList;
