import { useSearchParams } from "react-router";
import type { WatchStatus } from "../../types/Tracked";

const OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "toWatch", label: "À voir" },
  { value: "seen", label: "Vu" },
];

function WatchStatusFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get("status") ?? "all";

  function getButtonClasses(value: WatchStatus) {
    if (activeStatus === value) {
      return "border-b-2 border-focus-yellow px-0.5 pb-3 font-semibold text-focus-yellow";
    }
    return "border-b-2 border-transparent px-0.5 pb-3 text-focus-muted";
  }

  function handleStatusChange(value: WatchStatus) {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newSearchParams.delete("status");
    } else {
      newSearchParams.set("status", value);
    }
    setSearchParams(newSearchParams);
  }

  return (
    <search className="flex gap-4 justify-center md:justify-start md:gap-8 border-b border-focus-line/20 pt-3 text-xs md:text-base">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={activeStatus === option.value}
          className={getButtonClasses(option.value)}
          onClick={() => handleStatusChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </search>
  );
}

export default WatchStatusFilter;
