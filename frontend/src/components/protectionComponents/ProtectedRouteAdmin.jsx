import React, { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import LoadingAnimation from "../layout/LoadingAnimation.jsx";
import RestrictedPageAlert from "./RestrictedPageAlert.jsx";
import RedirectAlert from "./RedirectAlert.jsx";

const ProtectedRouteAdmin = ({ children }) => {
  const { isAuthenticated, isLoading, user, isAdmin } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (!isAuthenticated) {
    return (<RedirectAlert/>);
  }

  if (!isAdmin) {
    return (<RestrictedPageAlert/>);
  }

  return children;
};

export default ProtectedRouteAdmin;
