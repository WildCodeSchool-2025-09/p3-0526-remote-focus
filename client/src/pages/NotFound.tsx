import { NavLink } from "react-router";

function NotFound() {
  return (
    <>
      <h1>404</h1>
      <p>Cette page n'existe pas</p>

      <NavLink to="/">Retour à l'accueil</NavLink>
    </>
  );
}

export default NotFound;
