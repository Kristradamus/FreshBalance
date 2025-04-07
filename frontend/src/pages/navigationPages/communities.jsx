import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./communities.css";

export default function Communities() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goToSubscriptions = (path) => {
    navigate(path);
  };

  return (
    <div className="communitiesAlert">
        <div className="communitiesAlertContainer">
          <div className="communitiesAlertBox">
            <div className="communitiesAlertText">
              <h2 className="communitiesAlertMainTitle">{t("communities.accessDenied")}</h2>
              <p className="communitiesAlertSubTitle">{t("communities.personalPlan")}</p>
            </div>
            <div className="communitiesAlertButtons">
              <button className="communitiesCancelBtn" onClick={() => navigate(-1)}>{t("cancel")}</button>
              <button className="communitiesGoToBtn" onClick={() => goToSubscriptions("/subscriptions")}>{t("communities.goToSubscriptions")}</button>
            </div>
          </div>
        </div>
      </div>
  );
};
