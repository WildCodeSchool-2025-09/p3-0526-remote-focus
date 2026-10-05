import { Link } from "react-router";

type ProfileListSwitchProps = {
  active: "favorites" | "watchlist";
  favoritesCount: number;
  watchlistCount: number;
};

function getPillClasses(isActive: boolean) {
  if (isActive) {
    return "flex items-center gap-2 rounded-full bg-focus-yellow px-4 py-2 text-sm font-semibold text-focus-void";
  }
  return "flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-base-content transition-colors hover:border-white/60";
}

function ProfileListSwitch({
  active,
  favoritesCount,
  watchlistCount,
}: ProfileListSwitchProps) {
  return (
    <nav aria-label="Mes listes" className="flex gap-3">
      <Link
        to="/profile/favorites"
        aria-current={active === "favorites" ? "page" : undefined}
        className={getPillClasses(active === "favorites")}
      >
        Favoris · {favoritesCount}
      </Link>
      <Link
        to="/profile/watchlist"
        aria-current={active === "watchlist" ? "page" : undefined}
        className={getPillClasses(active === "watchlist")}
      >
        Watchlist · {watchlistCount}
      </Link>
    </nav>
  );
}

export default ProfileListSwitch;
