import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useSearch } from "../contexts/SearchContext";
import ProfileMenu from "./ProfileMenu";
import SearchBar from "./SearchBar";

const Header = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (value: string) => {
    setSearchQuery(value);

    if (location.pathname !== "/search") {
      navigate("/search");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-focus-line/20 bg-base-100/95 p-4 backdrop-blur">
      <div className="flex-1">
        <SearchBar value={searchQuery} onChange={handleChange} />
      </div>

      {isAuthenticated ? (
        <ProfileMenu />
      ) : (
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/login" className="btn btn-ghost btn-sm">
            Connexion
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Inscription
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
