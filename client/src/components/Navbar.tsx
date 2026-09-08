import { NavLink } from "react-router";

function Navbar() {
  return (
    <nav aria-label="Navigation principale">
      <NavLink to="/">Focus</NavLink>

      <NavLink to="/">Accueil</NavLink>
      <NavLink to="/catalog">Catalogue</NavLink>
      <NavLink to="/calendar">Calendrier</NavLink>
      <NavLink to="/profile">Profil</NavLink>
    </nav>
  );
}

export default Navbar;
