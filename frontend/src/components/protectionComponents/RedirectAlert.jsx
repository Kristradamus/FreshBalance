import { useNavigate, useLocation} from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./RedirectAlert.css";

const RedirectTo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const getLastPublicPage = () => {
    const lastPage = sessionStorage.getItem("lastPublicPage");
    return lastPage || "/";
  };

  return (
    <div className="authAlert">
      <div className="authAlertContainer">
        <div className="authAlertBox">
          <div className="authAlertText">
            <h2 className="authAlertMainTitle">{t("protectedRoute.loginRequiredTitle")}</h2>
            <p className="authAlertSubTitle">{t("protectedRoute.loginRequiredSubTitle")}</p>
          </div>
          <div className="authAlertButtons">
            <button className="authAlertCancelBtn" onClick={() => { navigate(getLastPublicPage()); }}>{t("cancel")}</button>
            <button className="authAlertBtn" onClick={() =>navigate("/email-check", {state: {from: location.pathname}})}>{t("protectedRoute.login")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RedirectTo;