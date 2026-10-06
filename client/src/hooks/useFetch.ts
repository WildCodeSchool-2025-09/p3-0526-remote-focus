import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../services/api";

function useFetch<T>(path: string | null) {
  const { token, logout } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(path != null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const headers: HeadersInit = {};

    if (token !== null) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (path == null) {
      return;
    }

    let active = true;

    setData(null);
    setLoading(true);
    setError(null);

    fetch(`${API_URL}${path}`, { headers })
      .then((response) => {
        if (response.status === 401) {
          logout();
        }
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        return response.json() as Promise<T>;
      })
      .then((json) => {
        if (active) {
          setData(json);
        }
      })
      .catch((err: Error) => {
        if (active) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [path, token, logout]);
  return { data, loading, error };
}

export default useFetch;
