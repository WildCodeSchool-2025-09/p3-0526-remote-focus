import { X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router";

interface LocationState {
  accountCreated?: boolean;
}

function AccountCreatedAlert() {
  const { state } = useLocation();
  const locationState = state as LocationState | null;

  const [isVisible, setIsVisible] = useState(
    locationState?.accountCreated === true,
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div className="alert alert-success mb-4 flex items-center justify-between">
      <span>
        Votre compte a bien été créé. Vous pouvez maintenant vous connecter.
      </span>

      <button
        type="button"
        aria-label="Fermer la notification"
        className="btn btn-ghost btn-sm"
        onClick={() => setIsVisible(false)}
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default AccountCreatedAlert;
