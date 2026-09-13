import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

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
      className={`input input-bordered flex items-center gap-2 ${stateClass}`}
    >
      <Search className="size-4 opacity-60" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Rechercher un film, une série, un animé..."
        className="grow"
      />
    </label>
  );
};

export default SearchBar;
