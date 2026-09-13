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

  const stateClass = hasNoResults
    ? "input-error"
    : value
      ? "input-warning"
      : "";

  return (
    <label
      className={`input input-bordered mx-2 flex w-full items-center gap-2 ${stateClass}`}
    >
      <Search className="size-4 opacity-60" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={
          isDesktop ? "Rechercher un film, une série, un animé..." : ""
        }
        className="grow"
      />
    </label>
  );
};

export default SearchBar;
