import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "../../types/Catalog";

type PaginationProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
};

function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Page précédente"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-sm">
        Page {page} / {totalPages}
      </span>

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Page suivante"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default Pagination;
