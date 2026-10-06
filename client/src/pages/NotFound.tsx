import { ArrowLeft, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router";

function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <section className="flex min-h-[70vh] flex-col">
      <div className="flex w-full justify-end px-4 py-6">
        <button
          type="button"
          onClick={handleGoBack}
          aria-label="Retour"
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/30 p-2.5 text-sm transition-colors hover:border-[#F2B705] hover:text-[#F2B705] lg:px-4 lg:py-2"
        >
          <ArrowLeft size={16} />
          <span className="hidden lg:inline">Retour</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-base-200 shadow-badge lg:h-24 lg:w-24">
          <X
            className="h-9 w-9 text-accent lg:h-11 lg:w-11"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl">Page inaccessible</h1>
          <p className="mx-auto max-w-xs text-sm text-focus-muted lg:max-w-md lg:text-base">
            Il me semble que vous vous êtes quelque peu égarés.
          </p>
        </div>

        <NavLink to="/" className="btn btn-primary btn-sm mt-2 lg:btn-md">
          Retour à l'accueil
        </NavLink>
      </div>
    </section>
  );
}

export default NotFound;
