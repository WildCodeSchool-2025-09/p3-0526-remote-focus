import { NavLink } from "react-router";
import { Home, Tv, Calendar, User } from "lucide-react";

function Navbar() {
  return (
    <nav aria-label="Navigation principale">
      <NavLink to="/">Focus</NavLink>
      <ul>
        <NavLink to="/">
          <Home size={18} />
          Accueil
        </NavLink>
        <NavLink to="/catalog">
          <Tv size={18} />
          Catalogue
        </NavLink>
        <NavLink to="/calendar">
          <Calendar size={18} />
          Calendrier
        </NavLink>
        <NavLink to="/profile">
          <User size={18} />
          Profil
        </NavLink>
      </ul>
    </nav>
  );
}

export default Navbar;
