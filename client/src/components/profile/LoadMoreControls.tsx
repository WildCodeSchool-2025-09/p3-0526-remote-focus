import { ChevronDown, ChevronUp } from "lucide-react";

type LoadMoreControlsProps = {
  canShowLess: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreError: boolean;
  onShowLess: () => void;
  onLoadMore: () => void;
};

function LoadMoreControls({
  canShowLess,
  hasMore,
  loadingMore,
  loadMoreError,
  onShowLess,
  onLoadMore,
}: LoadMoreControlsProps) {
  if (!hasMore && !canShowLess) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {loadMoreError && (
        <p className="text-sm text-focus-muted">
          Impossible de charger la suite. Réessaie.
        </p>
      )}
      <div className="flex justify-center gap-3">
        {canShowLess && (
          <button type="button" onClick={onShowLess} className="btn-cta-pill">
            Voir moins
            <ChevronUp size={16} />
          </button>
        )}
        {hasMore && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="btn-cta-pill"
          >
            {loadingMore ? (
              "Chargement…"
            ) : (
              <>
                Voir plus
                <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default LoadMoreControls;
