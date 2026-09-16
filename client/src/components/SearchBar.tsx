import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import useMediaQuery from "../hooks/useMediaQuery";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  hasNoResults?: boolean;
};

const SearchBar = ({
  value,
  onChange,
  hasNoResults = false,
}: SearchBarProps) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const showPlaceholder = useMediaQuery("(min-width: 500px)");
  const isCompact = !showPlaceholder && value.length === 0;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const borderClass = hasNoResults
    ? "input-error"
    : value
      ? "input-warning"
      : "";

  const iconClass = hasNoResults
    ? "text-error"
    : value
      ? "text-warning"
      : "opacity-60";

  const shapeClass = isCompact
    ? "w-12 h-12 justify-center gap-0 rounded-full"
    : "w-full gap-2 rounded-3xl";

  return (
    <label
      className={`input input-bordered mx-2 flex items-center bg-base-300 ${shapeClass} ${borderClass}`}
    >
      <Search className={`size-4 shrink-0 ${iconClass}`} />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={
          !showPlaceholder
            ? ""
            : isDesktop
              ? "Rechercher un film, une série,..."
              : "Recherche"
        }
        className={isCompact ? "w-0 border-0 p-0" : "grow"}
      />
    </label>
  );
};

export default SearchBar;
