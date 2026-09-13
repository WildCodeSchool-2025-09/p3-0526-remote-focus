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
  // Aligné sur le palier "lg" de Tailwind (1024px), déjà utilisé par Navbar/Header
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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

  return (
    <label
      className={`input input-bordered mx-2 rounded-3xl bg-base-300 flex w-full items-center gap-2 ${borderClass}`}
    >
      <Search className={`size-4 ${iconClass}`} />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={
          isDesktop ? "Rechercher un film, une série,..." : "Recherche"
        }
        className="grow"
      />
    </label>
  );
};

export default SearchBar;
