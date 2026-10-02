import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

// La session n'est fermée qu'une fois l'accueil affiché : si l'utilisateur
// était sur une page protégée, PrivateRoute ne doit pas rediriger vers /login
// avant que la navigation vers "/" soit effective.
function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (isLoggingOut && location.pathname === "/") {
      logout();
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, location.pathname, logout]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    navigate("/", { replace: true });
  };

  return { handleLogout, isLoggingOut };
}

export default useLogout;
