import { useState} from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./subscriptions.css"

export default function Subscriptions() {
const [isYearly,setIsYearly] = useState(false);
const navigate = useNavigate();
const { t } = useTranslation();
const subscriptionPlans = t("subscriptions.subscriptionPlans", {returnObject:true});

{/*-----------------------------------SMALL-JS----------------------------------*/}
const subHandleToggle = () => {setIsYearly(!isYearly);}

const handleTryFree = (type) => {
  navigate(`/try-free/${type.toLowerCase()}`);
}
const handleBuyNow = (type) => {
  const selectedPlan = subscriptionPlans.find(plan => plan.type === type);
  const price = isYearly ? selectedPlan.priceYear : selectedPlan.priceMonth;
  const period = isYearly ? t("subscriptions.year") : t("subscriptions.month");
  
  navigate(`/buy-now/${type.toLowerCase()}`, {
    state: {
      planType: type,
      planPrice: price,
      planPeriod: period,
    }
  });
}

{/*--------------------------------------REUSABLE--------------------------------------*/}
const SubscriptionPlan = ({ plan }) => {
return (
  <div className={`subPlan sub${plan.type}`}>
    <div className={`subPlanTop sub${plan.type}Top`}>
      <h2 className="subTopTitle">{plan.type}</h2>
      <div className="subPrice">
        <h1 className="subTopTitle">{isYearly ? plan.priceYear : plan.priceMonth}</h1>
        <div className="subSidePrice">
          <h4 className="subCurrency">{t("subscriptions.lv")}</h4>
          <h4 className="subTime">{isYearly ? `/${t("subscriptions.year")}` : `/${t("subscriptions.month")}`}</h4>
        </div>
      </div>
      <div className="subButtons">
        <button className={`subTryFree ${plan.type}TryFree`} onClick={() => handleTryFree(plan.type)}><strong>{t("subscriptions.tryFree")}</strong></button>
        <button className={`subBuyNow ${plan.type}BuyNow`} onClick={() => handleBuyNow(plan.type)}><strong>{t("subscriptions.buyNow")}</strong><i className="fa-solid fa-location-arrow"></i></button>
      </div>
    <hr></hr>
    </div>
    <div className={`subBottom sub${plan.type}Bottom`}>
      <ul className={`subBenefits sub${plan.type}Benefits`}>
        {plan.benefits.map((item, index) => (
          <li key={index} className="subBenefit">
            <strong className="subBenefitTitle"><i className="fa-solid fa-check"></i>{item.benefit}:</strong>
            <p className="subDescription">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  </div>
);};

{/*--------------------------------------MAIN--------------------------------------*/}
return (
  <div className="subscriptions">
    <div className="subBox">
      <div className="subToggleContainer" onClick={subHandleToggle}>
        <div className={`subToggleCircle ${isYearly ? "moveRight" : "moveLeft"}`}></div>
        <span className={`subToggleText ${!isYearly ? "active" : ""}`}><strong>{t("subscriptions.monthly")}</strong></span>
        <span className={`subToggleText ${isYearly ? "active" : ""}`}><strong>{t("subscriptions.yearly")}</strong></span>
      </div>
      <div className="subCategories">
        {subscriptionPlans.map((plan, index) => (
          <SubscriptionPlan key={index} plan={plan}/>
        ))}
      </div>
    </div>
  </div>
)};