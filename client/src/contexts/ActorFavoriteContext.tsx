import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type ActorFavoriteState,
  fetchActorFavorites,
  toggleActorFavorite as toggleActorFavoriteApi,
} from "../services/favoriteApi";
import { useAuth } from "./AuthContext";

type ActorFavoriteContextValue = {
  favorites: ActorFavoriteState[];
  toggleFavorite: (actorId: number) => Promise<void>;
};

const ActorFavoriteContext = createContext<ActorFavoriteContextValue | null>(
  null,
);

export function ActorFavoriteProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { token, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<ActorFavoriteState[]>([]);

  useEffect(() => {
    setFavorites([]);

    if (!isAuthenticated || token === null) {
      return;
    }

    let cancelled = false;

    fetchActorFavorites(token)
      .then((data) => {
        if (!cancelled) {
          setFavorites(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Impossible de charger les acteurs favoris :", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

  async function toggleFavorite(actorId: number) {
    if (token === null) {
      throw new Error("Vous devez être connecté.");
    }

    const updatedFavorite = await toggleActorFavoriteApi(actorId, token);

    setFavorites((currentFavorites) => {
      const otherFavorites = currentFavorites.filter(
        (favorite) => favorite.actorId !== actorId,
      );

      return updatedFavorite.isFavorite
        ? [...otherFavorites, updatedFavorite]
        : otherFavorites;
    });
  }

  return (
    <ActorFavoriteContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </ActorFavoriteContext.Provider>
  );
}

export function useActorFavorites() {
  const context = useContext(ActorFavoriteContext);

  if (context === null) {
    throw new Error(
      "useActorFavorites doit être utilisé dans un ActorFavoriteProvider",
    );
  }

  return context;
}
