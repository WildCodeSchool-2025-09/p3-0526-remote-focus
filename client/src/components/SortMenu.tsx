import type { ChangeEvent } from "react";
import type { SearchSortBy, SearchSortOrder } from "../types/Search";

type SortOption = {
  label: string;
  sortBy: SearchSortBy;
  sortOrder: SearchSortOrder;
};

const SORT_OPTIONS: SortOption[] = [
  { label: "Pertinence (nom)", sortBy: "name", sortOrder: "asc" },
  { label: "Note décroissante", sortBy: "rating", sortOrder: "desc" },
  { label: "Note croissante", sortBy: "rating", sortOrder: "asc" },
  { label: "Plus récent", sortBy: "date", sortOrder: "desc" },
  { label: "Plus ancien", sortBy: "date", sortOrder: "asc" },
];

function optionValue(option: SortOption): string {
  return `${option.sortBy}-${option.sortOrder}`;
}

type SortMenuProps = {
  sortBy: SearchSortBy;
  sortOrder: SearchSortOrder;
  onChange: (sortBy: SearchSortBy, sortOrder: SearchSortOrder) => void;
};

function SortMenu({ sortBy, sortOrder, onChange }: SortMenuProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = SORT_OPTIONS.find(
      (option) => optionValue(option) === event.target.value,
    );

    if (selected != null) {
      onChange(selected.sortBy, selected.sortOrder);
    }
  };

  return (
    <select
      className="select select-bordered select-sm"
      value={`${sortBy}-${sortOrder}`}
      onChange={handleChange}
      aria-label="Trier les résultats"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={optionValue(option)} value={optionValue(option)}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default SortMenu;
