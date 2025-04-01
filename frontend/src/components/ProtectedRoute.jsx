import { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext.jsx";
import LoadingAnimation from "./layout/LoadingAnimation.jsx";
import { useTranslation } from "react-i18next";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ children }) => {
const { isAuthenticated, isLoading } = useContext(AuthContext);
const { t } = useTranslation();
const navigate = useNavigate();
const location = useLocation();

useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    console.log("User not authenticated, showing login prompt");
  }
  console.log("Current location:", location);
  console.log("Location state:", location.state);
}, [isAuthenticated, isLoading, location]);

const getLastPublicPage = () => {
  const lastPage = sessionStorage.getItem("lastPublicPage");
  return lastPage || "/";
};

if (isLoading) {
  return <LoadingAnimation />;
}

if (!isAuthenticated) {
  return (
    <div className="authAlertContainer">
      <div className="authAlertBox">
        <div className="authAlertText">
          <h2 className="authAlertMainTitle">
            {t("protectedRoute.loginRequiredTitle")}
          </h2>
          <p className="authAlertSubTitle">
            {t("protectedRoute.loginRequiredSubTitle")}
          </p>
        </div>
        <div className="authAlertButtons">
          <button className="authAlertCancelBtn" onClick={() => {navigate(getLastPublicPage())}}>
            {t("cancel")}
          </button>
          <button
            className="authAlertBtn"
            onClick={() =>
              navigate("/email-check", { state: { from: location.pathname } })
            }
          >
            {t("protectedRoute.login")}
          </button>
        </div>
      </div>
    </div>
  );
}

return children;
};

export default ProtectedRoute;
