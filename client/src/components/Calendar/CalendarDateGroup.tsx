import type { CalendarGroup } from "../../types/Catalog";
import CalendarItem from "./CalendarItem";

type CalendarDateGroupProps = {
  group: CalendarGroup;
  mediaType: "movie" | "tv";
};

function formatGroupDate(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function CalendarDateGroup({ group, mediaType }: CalendarDateGroupProps) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-focus-muted-dark">
        {formatGroupDate(group.date)}
      </h2>
      <div className="flex flex-col gap-2">
        {group.items.map((item) => (
          <CalendarItem
            key={`${item.id}-${item.seasonNumber ?? ""}-${item.episodeNumber ?? ""}`}
            item={item}
            mediaType={mediaType}
          />
        ))}
      </div>
    </section>
  );
}

export default CalendarDateGroup;
