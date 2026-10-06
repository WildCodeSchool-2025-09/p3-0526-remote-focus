import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { Link } from "react-router";

type AuthRequiredModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function AuthRequiredModal({ isOpen, onClose }: AuthRequiredModalProps) {
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
        aria-labelledby="auth-required-title"
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
          id="auth-required-title"
          className="pr-6 text-lg font-bold text-base-content"
        >
          Vous devez être connecté pour effectuer cette action
        </h2>

        <div className="flex flex-col gap-3">
          <Link
            to="/login"
            onClick={onClose}
            className="w-full rounded-md bg-warning py-2.5 text-center text-sm font-semibold text-warning-content transition hover:brightness-95"
          >
            Se connecter
          </Link>

          <Link
            to="/register"
            onClick={onClose}
            className="w-full rounded-md border border-focus-cream/30 py-2.5 text-center text-sm font-semibold text-base-content transition hover:border-focus-cream"
          >
            Créer un compte
          </Link>
        </div>
      </dialog>
    </div>,
    document.body,
  );
}

export default AuthRequiredModal;
