import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";

type BackButtonProps = {
  to?: string;
  label?: string;
};

const BACK_BUTTON_CLASSES =
  "flex shrink-0 items-center gap-2 rounded-full border border-base-content/30 p-2.5 text-sm transition-colors hover:border-primary hover:text-primary lg:px-4 lg:py-2";

function BackButton({ to, label = "Retour" }: BackButtonProps) {
  const navigate = useNavigate();

  const content = (
    <>
      <ArrowLeft size={16} aria-hidden="true" />
      <span className="hidden lg:inline">{label}</span>
    </>
  );

  // Avec "to" : on va vers une page précise
  if (to != null) {
    return (
      <Link to={to} aria-label={label} className={BACK_BUTTON_CLASSES}>
        {content}
      </Link>
    );
  }

  // Sans "to" : on revient à la page précédente, ou à l'accueil
  // si on est arrivé directement sur cette page (lien partagé, nouvel onglet)
  const handleGoBack = () => {
    const historyIndex = window.history.state?.idx;

    if (typeof historyIndex === "number" && historyIndex > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoBack}
      aria-label={label}
      className={BACK_BUTTON_CLASSES}
    >
      {content}
    </button>
  );
}

export default BackButton;
