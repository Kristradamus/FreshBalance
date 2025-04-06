import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ConfirmationToast from "../../components/reusableComponents/ConfirmationToast.jsx";
import "./buyNowSubscription.css";

const BuyNowSubscription = () => {
  const { t } = useTranslation();
  const { planType } = useParams();
  const navigate = useNavigate();
  const lastPublicPage = sessionStorage.getItem("lastPublicPage") || "/";

  return(
    <div className="buyNowSubscription">
      <div className="buyNowSubscriptionBox"> 
        <div className="buyNowTop">
          <h2>Premium {planType} plan</h2>
          <p>Enjoy the full {planType} plan for completely free.</p>
          <div className="buyNowButtons">
            <button className="buyNowGoBackButton" onClick={() => navigate(lastPublicPage)}>{t("tryFree.goBack")}</button>
            <button className="buyNowSubmitButton" onClick={() => navigate(lastPublicPage, {state:{showToast:true, toastMessage:t("buyNow.success")}})}>Submit free trial</button>
          </div>
        </div>
        <hr></hr>
        <div className="buyNowBottom">
          <ul className="buyNowFeaturesBox">
           
          </ul>
        </div>
      </div>
    </div>
  )
}
export default BuyNowSubscription;