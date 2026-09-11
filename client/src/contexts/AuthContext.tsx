import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/User";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
};

const TOKEN_STORAGE_KEY = "focus_token";
const USER_STORAGE_KEY = "focus_user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );

  const setAuth = (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((current) => {
      if (current == null) {
        return current;
      }

      const nextUser = { ...current, ...patch };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: user != null,
        setAuth,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export { AuthProvider, useAuth };
