import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthUser, LoginResponse } from "../types/Auth";
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  getTokenExpiration,
} from "../utils/authStorage";

// Délai maximal accepté par setTimeout (environ 24,8 jours).
const MAX_TIMEOUT_DELAY = 2_147_483_647;

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function clearStoredSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

function readStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token === null) {
    return null;
  }

  const expiresAt = getTokenExpiration(token);

  if (expiresAt === null || expiresAt <= Date.now()) {
    clearStoredSession();
    return null;
  }

  return token;
}

function readStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (storedUser === null) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const login = useCallback((data: LoginResponse) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();

    setToken(null);
    setUser(null);
  }, []);

  // Déconnexion automatique à l'expiration du token.
  useEffect(() => {
    if (token === null) {
      return;
    }

    const expiresAt = getTokenExpiration(token);

    if (expiresAt === null) {
      logout();
      return;
    }

    const delay = expiresAt - Date.now();

    if (delay <= 0) {
      logout();
      return;
    }

    if (delay > MAX_TIMEOUT_DELAY) {
      return;
    }

    const timeoutId = window.setTimeout(logout, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [token, logout]);

  // Synchronisation de la session entre les onglets.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key !== null &&
        event.key !== TOKEN_STORAGE_KEY &&
        event.key !== USER_STORAGE_KEY
      ) {
        return;
      }

      setToken(readStoredToken());
      setUser(readStoredUser());
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: token !== null && user !== null,
      login,
      logout,
    }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider.",
    );
  }

  return context;
}
