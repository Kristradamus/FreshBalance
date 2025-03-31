import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';
import LoadingAnimation from "./layout/LoadingAnimation.jsx"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext)

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/email-check" replace />;
  }
  return children;
};

export default ProtectedRoute;