import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Guests land on the public home page, not the login form.
    return <Navigate to="/" replace />;
  }

  return children;
}