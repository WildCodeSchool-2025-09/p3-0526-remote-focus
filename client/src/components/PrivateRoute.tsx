import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
