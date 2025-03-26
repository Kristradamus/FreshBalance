import React, { useState } from "react";
import "./SecurityComponent.css";
import {useTranslation} from "react-i18next";

export default function SecurityComponent(){
const { t } = useTranslation();

return (
  <div className="profileContentAreaSecurity">
    <h2 className="securityMainTitle">{t("profile.securityMainTitle")}</h2>
    <div className="securitySection">
      <div className="securityItem">
        <div className="securityHeader">
          <div className="securityItemTitle">
            <h3>{t("profile.securityChangePasswordTitle")}</h3>
          </div>
          <button className="securityButton">{t("profile.securityChange")}</button>
        </div>
        <p className="securityDescription">{t("profile.securityRecommendation")}</p>
      </div>
      <div className="securityItem">
        <div className="securityHeader">
          <div className="securityItemTitle">
            <h3>{t("profile.securityTwoFactorVerificationTitle")}</h3>
          </div>
          <label className="toggleSwitch">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
        </div>
        <p className="securityDescription">{t("profile.securityTwoFactorVerificationText")}</p>
      </div>
    </div>
  </div>
);};