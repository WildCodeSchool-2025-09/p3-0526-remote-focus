import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type SearchContextValue = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

const SearchContext = createContext<SearchContextValue | undefined>(
  undefined,
);

const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
};

const useSearch = () => {
  const context = useContext(SearchContext);

  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }

  return context;
};

export { SearchProvider, useSearch };
