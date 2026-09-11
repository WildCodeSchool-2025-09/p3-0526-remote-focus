import { Calendar, Home, Tv, User } from "lucide-react";
import { NavLink } from "react-router";
import logoFocus from "../assets/images/logoFocus.png";

function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-xs transition-colors
     lg:flex-none lg:flex-row lg:gap-3 lg:px-3 lg:text-lg ${isActive
      ? "bg-primary/10 text-primary font-semibold"
      : "text-base-content/70 hover:text-base-content lg:hover:bg-base-300"
    }`;

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 flex gap-1 border-t border-focus-line/20 bg-base-100 p-2
                 lg:sticky lg:top-0 lg:inset-x-auto lg:bottom-auto lg:h-screen lg:shrink-0
                 lg:flex-col lg:gap-2 lg:border-t-0 lg:border-r lg:px-4 lg:py-6 lg:max-w-max"
    >
      <NavLink to="/" end className="mb-8 hidden lg:block">
        <img src={logoFocus} alt="Focus" width={100} />
      </NavLink>

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

export default Navbar;
