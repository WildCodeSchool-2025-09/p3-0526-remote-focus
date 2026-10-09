import { Star, X } from "lucide-react";
import { createPortal } from "react-dom";

type RatingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  rating: number;
  setRating: (rating: number) => void;
};

function RatingModal({ isOpen, onClose, rating, setRating }: RatingModalProps) {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <button
        type="button"
        aria-label="Fermer la fenêtre"
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-focus-void/80"
        onClick={onClose}
      />
      <dialog
        open
        aria-modal="true"
        aria-labelledby="rating-media"
        className="relative m-0 w-full max-w-sm space-y-6 rounded-2xl border-0 bg-base-200 p-8 text-base-content shadow-xl"
      >
        <button
          type="button"
          aria-label="Fermer"
          className="absolute right-4 top-4 text-base-content/50 transition hover:text-base-content"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2
          id="rating-media"
          className="pr-6 text-lg font-bold text-base-content text-center"
        >
          Attribuez une note à ce média
        </h2>
        <div className="flex gap-1 justify-center">
          <button
            type="button"
            className="text-focus-yellow"
            aria-label="Noter 1 étoile"
            onClick={() => setRating(1)}
          >
            <Star
              fill={rating > 0 ? "#F2B705" : undefined}
              className="text-focus-yellow"
            />
          </button>
          <button
            type="button"
            className="text-focus-yellow"
            aria-label="Noter 2 étoiles"
            onClick={() => setRating(2)}
          >
            <Star
              fill={rating >= 2 ? "#F2B705" : undefined}
              className="text-focus-yellow"
            />
          </button>
          <button
            type="button"
            className="text-focus-yellow"
            aria-label="Noter 3 étoiles"
            onClick={() => setRating(3)}
          >
            <Star
              fill={rating >= 3 ? "#F2B705" : undefined}
              className="text-focus-yellow"
            />
          </button>
          <button
            type="button"
            className="text-focus-yellow"
            aria-label="Noter 4 étoiles"
            onClick={() => setRating(4)}
          >
            <Star
              fill={rating >= 4 ? "#F2B705" : undefined}
              className="text-focus-yellow"
            />
          </button>
          <button
            type="button"
            className="text-focus-yellow"
            aria-label="Noter 5 étoiles"
            onClick={() => setRating(5)}
          >
            <Star
              fill={rating === 5 ? "#F2B705" : undefined}
              className="text-focus-yellow"
            />
          </button>
        </div>
        <p className="italic text-focus-muted-dark text-sm">
          Fonctionnalité à venir ...
        </p>
      </dialog>
    </div>,
    document.body,
  );
}

export default RatingModal;
