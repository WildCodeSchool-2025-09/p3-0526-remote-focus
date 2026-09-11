import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { updateTheme as updateThemeApi } from "../services/api";
import { useAuth } from "./AuthContext";

type ThemeContextValue = {
  isDarkTheme: boolean;
  setDarkTheme: (isDark: boolean) => void;
};

const THEME_STORAGE_KEY = "focus_dark_theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(): boolean {
  return localStorage.getItem(THEME_STORAGE_KEY) !== "false";
}

function applyThemeAttribute(isDark: boolean) {
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "focus" : "focus-light",
  );
}

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, updateUser } = useAuth();
  const [isDarkTheme, setIsDarkTheme] = useState(
    () => user?.darkTheme ?? readStoredTheme(),
  );

  useEffect(() => {
    applyThemeAttribute(isDarkTheme);
    localStorage.setItem(THEME_STORAGE_KEY, String(isDarkTheme));
  }, [isDarkTheme]);

  useEffect(() => {
    if (user != null) {
      setIsDarkTheme(user.darkTheme);
    }
  }, [user]);

  const setDarkTheme = (isDark: boolean) => {
    setIsDarkTheme(isDark);

    if (token != null) {
      updateThemeApi(isDark, token)
        .then(updateUser)
        .catch(() => {
          setIsDarkTheme(!isDark);
        });
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export { ThemeProvider, useTheme };
