import { useLocation, useNavigate } from "react-router";
import { useSearch } from "../contexts/SearchContext";
import SearchBar from "./SearchBar";

const Header = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (value: string) => {
    setSearchQuery(value);

    if (location.pathname !== "/search") {
      navigate("/search");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-base-100/95 backdrop-blur border-b border-focus-line/20 p-4">
      <SearchBar value={searchQuery} onChange={handleChange} />
    </header>
  );
};

export default Header;
