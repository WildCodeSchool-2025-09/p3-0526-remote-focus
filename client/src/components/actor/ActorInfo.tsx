import { ChevronDown } from "lucide-react";
import { useState } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";
import type { Actor } from "../../types/media";

const WORD_LIMIT_DESKTOP = 150;
const WORD_LIMIT_MOBILE = 50;
const WORD_LIMIT_SMALL_MOBILE = 12;

function getWordLimit(isDesktop: boolean, isSmallMobile: boolean): number {
  if (isDesktop) {
    return WORD_LIMIT_DESKTOP;
  }
  if (isSmallMobile) {
    return WORD_LIMIT_SMALL_MOBILE;
  }
  return WORD_LIMIT_MOBILE;
}

type ActorInfoProps = {
  actor: Actor;
};

function ActorInfo({ actor }: ActorInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isSmallMobile = useMediaQuery("(max-width: 767px)");

  if (actor.biography == null) {
    return null;
  }

  const wordLimit = getWordLimit(isDesktop, isSmallMobile);
  const words = actor.biography.trim().split(/\s+/);
  const isTruncatable = words.length > wordLimit;
  const displayedText =
    isExpanded || !isTruncatable
      ? actor.biography
      : `${words.slice(0, wordLimit).join(" ")}…`;

  const handleToggle = () => {
    setIsExpanded((previous) => !previous);
  };

  return (
    <div className="max-w-[660px]">
      <p className="text-base leading-relaxed text-[#C9D6DB]">
        {displayedText}
      </p>

      {isTruncatable && (
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isExpanded}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-[#F2B705]"
        >
          {isExpanded ? "Réduire" : "Lire la suite"}
          <ChevronDown
            size={16}
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}

export default ActorInfo;
