import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};
