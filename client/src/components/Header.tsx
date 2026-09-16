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
    <header className="sticky top-0 z-30 bg-base-100/95 backdrop-blur border-b border-focus-line/20 p-4">
      <div className="relative grid grid-cols-3 items-center">
        <NavLink to="/" end className="lg:hidden">
          <img src={logoFocus} alt="Focus" width={100} />
        </NavLink>

        <div
          className={
            isTyping
              ? "absolute inset-0 z-10 flex items-center bg-base-100 lg:static lg:z-auto lg:col-start-2"
              : "col-start-2 flex justify-center"
          }
        >
          <SearchBar
            value={searchQuery}
            onChange={handleChange}
            hasNoResults={hasNoResults}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
