import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requiredRole = "admin",
}) => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    return <Navigate to="/login" replace />;
  }

  const { user } = userContext;

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and user doesn't have it, redirect to home
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return element;
};
