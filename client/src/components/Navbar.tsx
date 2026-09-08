import { NavLink } from "react-router";
import logo_focus from "/images/logo_focus.png";
import { Home, Tv, Calendar, User } from "lucide-react";

function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-lg transition-colors ${
      isActive
        ? "bg-primary/10 text-primary font-semibold"
        : "text-base-content/70 hover:bg-base-300 hover:text-lg-content"
    }`;

  return (
    <aside className="hidden border-r border-focus-line/20 bg-base-100 px-4 py-6 lg:block lg:sticky lg:top-0 lg:h-screen lg:w-52 lg:shrink-0">
      <nav aria-label="Navigation principale">
        <NavLink to="/" className="mb-8 block">
          <img src={logo_focus} alt="Focus" width={100} />
        </NavLink>

        <ul className="flex flex-col gap-2 mr-2">
          <li>
            <NavLink to="/" end className={linkClass}>
              <Home size={20} />
              <span>Accueil</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/catalog" className={linkClass}>
              <Tv size={20} />
              <span>Catalogue</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/calendar" className={linkClass}>
              <Calendar size={20} />
              <span>Calendrier</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/profile" className={linkClass}>
              <User size={20} />
              <span>Profil</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Navbar;
