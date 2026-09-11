import { useState } from "react";
import CatalogGrid from "../components/Catalog/CatalogGrid";
import TypeFilterTabs from "../components/TypeFilterTabs";
import { useAuth } from "../contexts/AuthContext";
import { useLoadMoreMedias } from "../hooks/useLoadMoreMedias";
import { fetchInProgress } from "../services/api";
import type { Format } from "../types/Catalog";

const PAGE_SIZE = 10;

function InProgress() {
  const { token } = useAuth();
  const [type, setType] = useState<Format>(null);

  const { items, loading, error, hasMore, loadMore } = useLoadMoreMedias(
    (page) => fetchInProgress(token as string, type, page, PAGE_SIZE),
    [type, token],
  );

  return (
    <div>
      <h1>Vu : en cours</h1>

      <div className="mt-4">
        <TypeFilterTabs value={type} onChange={setType} />
      </div>

      {loading && items.length === 0 && (
        <span className="loading loading-spinner text-primary mt-8" />
      )}

      {!loading && error && (
        <p className="text-error mt-8">
          Impossible de charger vos médias en cours, réessayez plus tard.
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

export default InProgress;
