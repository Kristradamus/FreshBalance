import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import "./subscriptions.css"

export default function Subscriptions() {
const [isYearly,setIsYearly] = useState(false);

const { t } = useTranslation();
const subscriptionPlans = t("subscriptions.subscriptionPlans", {returnObject:true});

{/*--------------------------------------HANDLE-TOGGLE--------------------------------------*/}
const subHandleToggle = () => {
setIsYearly(!isYearly);
}

{/*--------------------------------------REUSABLE--------------------------------------*/}
const SubscriptionPlan = ({ plan }) => {
return (
  <div className={`subPlan sub${plan.type}`}>
    <div className={`subPlanTop sub${plan.type}Top`}>
      <h1 className="subTopTitle">{plan.type}</h1>
      <div className="subPrice">
        <h1 className="subTopTitle">{isYearly ? plan.priceYear : plan.priceMonth}</h1>
        <div className="subSidePrice">
          <h4 className="subCurrency">{t("subscriptions.lv")}</h4>
          <h4 className="subTime">{isYearly ? "/year" : "/month"}</h4>
        </div>
      </div>
      <div className="subButtons">
        <button className={`subTryFree ${plan.type}TryFree`}><strong>{t("subscriptions.tryFree")}</strong></button>
        <button className={`subBuyNow ${plan.type}BuyNow`}><strong>{t("subscriptions.buyNow")}</strong><i className="fa-solid fa-location-arrow"></i></button>
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
)};

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