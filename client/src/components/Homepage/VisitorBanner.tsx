import { Link } from "react-router";

function VisitorBanner() {
  return (
    <section className="mx-auto mt-6 w-[88%] rounded-box bg-base-200 px-5 py-4 md:w-[82%] md:px-6 md:py-5">
      <div className="flex flex-col items-center gap-3 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h2 className="text-base font-semibold leading-tight md:text-2xl">
            Créer un compte pour personnaliser
          </h2>

          <p className="mt-1 text-xs leading-snug text-base-content/60 md:text-sm">
            Recommandations selon vos genres, watchlist synchronisée.
          </p>
        </div>

        <Link to="/register" className="btn btn-primary btn-sm md:btn-md">
          Créer mon compte
        </Link>
      </div>
    </section>
  );
}

export default VisitorBanner;
