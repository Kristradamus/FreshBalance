import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./RedirectAlert.css";

const RedirectAlertForFunctions = ({show, onClose}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="authAlert">
      <div className="authAlertContainer">
        <div className="authAlertBox">
          <div className="authAlertText">
            <h2 className="authAlertMainTitle">{t("protectedRoute.loginRequiredTitle")}</h2>
            <p className="authAlertSubTitle">{t("protectedRoute.functionalityRestricted")}</p>
          </div>
          <div className="authAlertButtons">
            <button className="authAlertCancelBtn" onClick={onClose}>{t("cancel")}</button>
            <button className="authAlertBtn" onClick={() =>navigate("/email-check", {state: {from: location.pathname}})}>{t("protectedRoute.login")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RedirectAlertForFunctions;