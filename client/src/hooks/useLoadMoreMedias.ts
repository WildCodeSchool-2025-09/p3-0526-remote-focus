import { useEffect, useState } from "react";
import type { CatalogResponse } from "../types/Catalog";

export function useLoadMoreMedias(
  fetcher: (page: number) => Promise<CatalogResponse>,
  // biome-ignore lint/suspicious/noExplicitAny: deps forwarded as-is to the effect below, shape decided by the caller
  deps: any[],
) {
  const [items, setItems] = useState<CatalogResponse["data"]>([]);
  const [pagination, setPagination] = useState<
    CatalogResponse["pagination"] | null
  >(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset driven by the caller's own deps (filters), not by fetcher's identity
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setPage(1);

    fetcher(1)
      .then((response) => {
        if (active) {
          setItems(response.data);
          setPagination(response.pagination);
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
  }, deps);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoading(true);

    fetcher(nextPage)
      .then((response) => {
        setItems((current) => [...current, ...response.data]);
        setPagination(response.pagination);
        setPage(nextPage);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  const hasMore = pagination != null && items.length < pagination.total;

  return { items, loading, error, hasMore, loadMore };
}
