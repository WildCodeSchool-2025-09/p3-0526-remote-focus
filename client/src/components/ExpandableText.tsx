import { ChevronDown } from "lucide-react";
import { useState } from "react";
import useMediaQuery from "../hooks/useMediaQuery";

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

type ExpandableTextProps = {
  text: string;
};

function ExpandableText({ text }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isSmallMobile = useMediaQuery("(max-width: 767px)");

  // Quand le texte change (autre film, autre saison…), on le referme
  if (text !== currentText) {
    setCurrentText(text);
    setIsExpanded(false);
  }

  const wordLimit = getWordLimit(isDesktop, isSmallMobile);
  const words = text.trim().split(/\s+/);
  const isTruncatable = words.length > wordLimit;
  const displayedText =
    isExpanded || !isTruncatable
      ? text
      : `${words.slice(0, wordLimit).join(" ")}…`;

  const handleToggle = () => {
    setIsExpanded((previous) => !previous);
  };

  return (
    <div className="max-w-[660px]">
      <p className="text-base leading-relaxed text-base-content/80">
        {displayedText}
      </p>

      {isTruncatable && (
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isExpanded}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-primary"
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

export default ExpandableText;
