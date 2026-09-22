import { useEffect, useState } from "react";
import { API_URL } from "../services/api";

function useFetch<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(path != null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (path == null) {
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    fetch(`${API_URL}${path}`)
      .then((response) => {
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
  }, [path]);

  return { data, loading, error };
}

export default useFetch;
