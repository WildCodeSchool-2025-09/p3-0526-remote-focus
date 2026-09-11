import { useState } from "react";
import CatalogGrid from "../components/Catalog/CatalogGrid";
import TypeFilterTabs from "../components/TypeFilterTabs";
import { useAuth } from "../contexts/AuthContext";
import { useLoadMoreMedias } from "../hooks/useLoadMoreMedias";
import { fetchWatchlist } from "../services/api";
import type { WatchedListFilter } from "../services/api";
import type { Format } from "../types/Catalog";

const PAGE_SIZE = 10;

const WATCHED_TABS: { label: string; value: WatchedListFilter }[] = [
  { label: "Tous", value: null },
  { label: "À voir", value: "to-watch" },
  { label: "Vu", value: "watched" },
];

function Watchlist() {
  const { token } = useAuth();
  const [type, setType] = useState<Format>(null);
  const [watched, setWatched] = useState<WatchedListFilter>(null);

  const { items, loading, error, hasMore, loadMore } = useLoadMoreMedias(
    (page) => fetchWatchlist(token as string, type, watched, page, PAGE_SIZE),
    [type, watched, token],
  );

  return (
    <div>
      <h1>Ma watchlist</h1>

      <div className="mt-4 flex flex-col gap-3">
        <TypeFilterTabs value={type} onChange={setType} />

        <div className="tabs tabs-boxed w-fit">
          {WATCHED_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={`tab ${watched === tab.value ? "tab-active" : ""}`}
              onClick={() => setWatched(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && items.length === 0 && (
        <span className="loading loading-spinner text-primary mt-8" />
      )}

      {!loading && error && (
        <p className="text-error mt-8">
          Impossible de charger votre watchlist, réessayez plus tard.
        </p>
      )}

      {!error && <CatalogGrid medias={items} />}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Chargement..." : "Voir plus"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Watchlist;
