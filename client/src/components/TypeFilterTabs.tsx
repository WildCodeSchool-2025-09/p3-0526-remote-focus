import type { Format } from "../types/Catalog";

type TypeFilterTabsProps = {
  value: Format;
  onChange: (format: Format) => void;
};

const TABS: { label: string; value: Format }[] = [
  { label: "Tous", value: null },
  { label: "Films", value: "movie" },
  { label: "Séries", value: "tv" },
  { label: "Animés", value: "anime" },
];

function TypeFilterTabs({ value, onChange }: TypeFilterTabsProps) {
  return (
    <div className="tabs tabs-boxed w-fit">
      {TABS.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className={`tab ${value === tab.value ? "tab-active" : ""}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default TypeFilterTabs;
