import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className="input input-bordered flex items-center gap-2">
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
