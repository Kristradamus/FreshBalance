import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";

export default function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  } 
  else if (isAuthenticated) {
    return <Navigate to="/profile/settings" replace />;
  }

  return children;
}
