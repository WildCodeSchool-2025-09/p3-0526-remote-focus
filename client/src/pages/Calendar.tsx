import { useEffect, useState } from "react";
import CalendarDateGroup from "../components/Calendar/CalendarDateGroup";
import CalendarTabs from "../components/Calendar/CalendarTabs";
import { useAuth } from "../contexts/AuthContext";
import { fetchCalendar } from "../services/catalogService";
import type { CalendarFormat, CalendarGroup } from "../types/Catalog";

function Calendar() {
  const { token } = useAuth();
  const [format, setFormat] = useState<CalendarFormat>("movie");
  const [groups, setGroups] = useState<CalendarGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    fetchCalendar(format, token ?? undefined)
      .then((data) => {
        if (active) {
          setGroups(data);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [format, token]);

  const mediaType = format === "movie" ? "movie" : "tv";

  return (
    <div>
      <h1>Calendrier</h1>

      <div className="mt-4">
        <CalendarTabs value={format} onChange={setFormat} />
      </div>

      {loading && (
        <span className="loading loading-spinner text-primary mt-8" />
      )}

      {!loading && error && (
        <p className="text-error mt-8">
          Impossible de charger le calendrier, réessayez plus tard.
        </p>
      )}

      {!loading && !error && groups.length === 0 && (
        <p className="text-focus-muted-dark mt-8">
          Aucune sortie disponible sur cette période.
        </p>
      )}

      {!loading && !error && groups.length > 0 && (
        <div className="mt-6 flex flex-col gap-6">
          {groups.map((group) => (
            <CalendarDateGroup
              key={group.date}
              group={group}
              mediaType={mediaType}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Calendar;
