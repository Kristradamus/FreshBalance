import { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import LoadingAnimation from "../layout/LoadingAnimation.jsx";
import RedirectAlert from "./RedirectAlert.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (!isAuthenticated) {
    return (<RedirectAlert/>);
  }

  return children;
};

export default ProtectedRoute;
