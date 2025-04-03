import Header from "../../components/layout/Header.jsx";
import Navigation from "../../components/layout/Navigation.jsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./communities.css";

export default function Communities() {
const navigate = useNavigate();
const { t } = useTranslation();

const goToSubscriptions = (path) => {
  navigate(path);
};

return (
<>
  <Header/>
  <Navigation/>
  <div className="communities">
    <div className="communitiesColorOverlay">
      <div className="communitiesBox">
        <div className="communitiesTop">
          <h1>{t("communities.accessDenied")}</h1>
        </div>
        <div className="communitiesBottom">
          <h5 className="communitiesPlan">{t("communities.personalPlan")}</h5>
          <button className="communitiesGoToSub" onClick={() => goToSubscriptions("/subscriptions")}>
            {t("communities.goToSubscriptions")}
          </button>
        </div>
      </div>
    </div>
  </div>
</>
);};
