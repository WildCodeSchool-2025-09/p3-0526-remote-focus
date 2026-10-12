import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

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
