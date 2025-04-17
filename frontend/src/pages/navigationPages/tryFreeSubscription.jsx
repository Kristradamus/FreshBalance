import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./tryFreeSubscription.css";

const TryFreeSubscription = () => {
  const { t } = useTranslation();
  const { planType } = useParams();
  const navigate = useNavigate();
  const lastPublicPage = sessionStorage.getItem("lastPublicPage") || "/";
  const freeTrialFeatures = t("tryFree.features", {returnObject:true});

  return(
    <div className="tryFreeSubscription">
      <div className="tryFreeSubscriptionBox"> 
        <div className="tryFreeTop">
          <h2>{t("tryFree.mainTitle")}</h2>
          <p>{t("tryFree.subTitlePart1")} {planType} {t("tryFree.subTitlePart2")}</p>
          <div className="tryFreeButtons">
            <button className="tryFreeGoBackButton" onClick={() => navigate(lastPublicPage)}>{t("tryFree.goBack")}</button>
            <button className="tryFreeSubmitButton" onClick={() => navigate(lastPublicPage, {state:{showToast:true, toastMessage:t("tryFree.success")}})}>{t("tryFree.startTrial")}</button>
          </div>
        </div>
        <hr/>
        <div className="tryFreeBottom">
          <ul className="tryFreeFeaturesBox">
            {freeTrialFeatures.map((item, index) => (
              <li key={index} className="tryFreeFeature"><i className="fa-solid fa-check"></i> {item.feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
export default TryFreeSubscription;