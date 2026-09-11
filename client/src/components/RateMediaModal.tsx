import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { rateMedia } from "../services/api";
import type { RatingScope } from "../services/api";
import Modal from "./Modal";
import RatingInput from "./RatingInput";

type RateMediaModalProps = {
  scope: RatingScope;
  mediaId: number;
  initialRating: number | null;
  onClose: () => void;
  onRated: (rating: number | null) => void;
};

function RateMediaModal({
  scope,
  mediaId,
  initialRating,
  onClose,
  onRated,
}: RateMediaModalProps) {
  const { token } = useAuth();
  const [rating, setRating] = useState<number | null>(initialRating);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (nextRating: number | null) => {
    if (token == null) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await rateMedia(scope, mediaId, nextRating, token);
      onRated(result.userRating);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title="Noter ce média">
      <div className="flex flex-col items-center gap-4">
        <RatingInput value={rating} onChange={setRating} />
        <p className="text-focus-muted-dark text-sm">
          {rating != null ? `${rating}/5` : "Sélectionnez une note"}
        </p>

        {error != null && <p className="text-error text-sm">{error}</p>}

        <div className="modal-action w-full justify-between">
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            {initialRating != null && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => submit(null)}
                disabled={isSaving}
              >
                Effacer la note
              </button>
            )}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => submit(rating)}
            disabled={isSaving || rating == null}
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default RateMediaModal;
