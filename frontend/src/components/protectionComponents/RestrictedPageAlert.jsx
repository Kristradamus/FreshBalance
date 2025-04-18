import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./RestrictedPageAlert.css";

const RestrictedPageAlert = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getLastPublicPage = () => {
    const lastPage = sessionStorage.getItem("lastPublicPage");
    return lastPage || "/";
  };
  return (
    <div className="restrictedAlert">
      <div className="restrictedAlertContainer">
        <div className="restrictedAlertBox">
          <div className="restrictedAlertText">
            <h2 className="restrictedAlertMainTitle">{t("protectedRoute.restrictedTitle")}</h2>
            <p className="restrictedAlertSubTitle">{t("protectedRoute.restrictedSubTitle")}</p>
          </div>
          <button className="restrictedAlertGoBackBtn" onClick={() => { navigate(getLastPublicPage()); }}>{t("protectedRoute.restrictedGoBack")}</button>
        </div>
      </div>
    </div>
  );
};

export default RestrictedPageAlert;