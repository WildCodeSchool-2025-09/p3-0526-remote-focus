import { NavLink } from "react-router";
import { Home, Tv, Calendar, User } from "lucide-react";

function MobileNavbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-xs transition-colors ${
      isActive
        ? "bg-primary/10 text-primary font-semibold"
        : "text-base-content/70 hover:text-base-content"
    }`;

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 flex gap-1 border-t border-focus-line/20 bg-base-100 p-2 lg:hidden"
    >
      <NavLink to="/" end className={linkClass}>
        <Home size={20} />
        <span>Accueil</span>
      </NavLink>
      <NavLink to="/catalog" className={linkClass}>
        <Tv size={20} />
        <span>Catalogue</span>
      </NavLink>
      <NavLink to="/calendar" className={linkClass}>
        <Calendar size={20} />
        <span>Calendrier</span>
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        <User size={20} />
        <span>Profil</span>
      </NavLink>
    </nav>
  );
}

export default MobileNavbar;
