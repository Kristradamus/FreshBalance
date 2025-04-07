import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./buyNowSubscription.css";

const BuyNowSubscription = () => {
  const { t } = useTranslation();
  const { planType } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const lastPublicPage = sessionStorage.getItem("lastPublicPage") || "/";
  const buyNowFeatures = t("buyNow.features", {returnObject:true});

  return(
    <div className="buyNowSubscription">
      <div className="buyNowSubscriptionBox"> 
        <div className="buyNowTop">
          <h2>{t("buyNow.mainTitlePart1")} {planType} {t("buyNow.mainTitlePart2")}</h2>
          <p>{t("buyNow.subTitlePart1")} {state.planType} {t("buyNow.subTitlePart2")}</p>
          <div className="buyNowPrice">
            <h1 className="buyNowTopTitle">{state.planPrice}</h1>
            <div className="buyNowSidePrice">
              <h4 className="buyNowCurrency">{t("buyNow.lv")}.</h4>
              <h4 className="buyNowTime">/{state.planPeriod}</h4>
            </div>
          </div>
          <div className="buyNowButtons">
            <button className="buyNowGoBackButton" onClick={() => navigate(lastPublicPage)}>{t("tryFree.goBack")}</button>
            <button className="buyNowSubmitButton" onClick={() => navigate(lastPublicPage, {state:{showToast:true, toastMessage:`${t("buyNow.successPart1")} ${state.planType} ${t("buyNow.successPart2")}`}})}>{t("buyNow.startPlan")}</button>
          </div>
        </div>
        <hr></hr>
        <div className="buyNowBottom">
          <ul className="buyNowFeaturesBox">
            {buyNowFeatures.map((item, index) => (
              <li className="buyNowFeature" key={index}><i className="fa-solid fa-check"></i> {item.feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
export default BuyNowSubscription;