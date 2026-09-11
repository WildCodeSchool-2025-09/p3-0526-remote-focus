import type { CalendarFormat } from "../../types/Catalog";

type CalendarTabsProps = {
  value: CalendarFormat;
  onChange: (format: CalendarFormat) => void;
};

const TABS: { label: string; value: CalendarFormat }[] = [
  { label: "Films", value: "movie" },
  { label: "Séries", value: "tv" },
  { label: "Animés", value: "anime" },
];

function CalendarTabs({ value, onChange }: CalendarTabsProps) {
  return (
    <div className="tabs tabs-boxed w-fit">
      {TABS.map((tab) => (
        <button
          key={tab.value}
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

export default CalendarTabs;
