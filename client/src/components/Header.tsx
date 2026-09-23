import { Power } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router";

import logoFocus from "../assets/images/logoFocus.png";
import { useSearch } from "../contexts/SearchContext";
import SearchBar from "./SearchBar";

const Header = () => {
  const { searchQuery, setSearchQuery, hasNoResults } = useSearch();

  const navigate = useNavigate();
  const location = useLocation();

  const isTyping = searchQuery.length > 0;

  const handleChange = (value: string) => {
    setSearchQuery(value);

    if (location.pathname !== "/search") {
      navigate("/search");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-focus-line/20 bg-base-100/95 p-4 backdrop-blur">
      <div className="relative grid grid-cols-3 items-center gap-3">
        <NavLink
          to="/"
          end
          className="row-start-1 justify-self-start lg:hidden"
        >
          <img src={logoFocus} alt="Focus" width={100} />
        </NavLink>

        <div
          className={
            isTyping
              ? "absolute inset-0 z-10 flex items-center bg-base-100 lg:static lg:col-start-2 lg:row-start-1 lg:z-auto lg:justify-center"
              : "col-start-3 row-start-1 mr-10 flex items-center justify-end lg:col-start-2 lg:mr-0 lg:justify-center"
          }
        >
          <SearchBar
            value={searchQuery}
            onChange={handleChange}
            hasNoResults={hasNoResults}
          />
        </div>

        <div className="col-start-3 row-start-1 flex items-center justify-end">
          <NavLink
            to="/login"
            aria-label="Se connecter"
            className="flex size-10 items-center justify-center text-base-content transition hover:text-warning lg:hidden"
          >
            <Power size={22} />
          </NavLink>

          <div className="hidden items-center gap-3 lg:flex">
            <NavLink
              to="/login"
              className="flex items-center gap-2 rounded-md border border-base-content/40 px-4 py-2 text-sm font-semibold text-base-content transition hover:bg-base-200"
            >
              <Power size={17} />
              Connexion
            </NavLink>

            <NavLink
              to="/register"
              className="rounded-md bg-warning px-4 py-2 text-sm font-semibold text-warning-content transition hover:brightness-95"
            >
              Inscription
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
