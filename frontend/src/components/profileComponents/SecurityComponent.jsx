import React from "react";
import "./SecurityComponent.css";
import { useTranslation } from "react-i18next";

const SecurityComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="profileContentAreaSecurity">
      <h2 className="securityMainTitle">{t("profile.securityMainTitle")}</h2>
      <div className="securitySection">
        <div className="securityItem">
          <div className="securityHeader">
            <div className="securityItemTitleBox">
              <h3 className="securityItemTitle">{t("profile.securityChangePasswordTitle")}</h3>
            </div>
            <button className="securityButton">{t("profile.securityChange")}</button>
          </div>
          <p className="securityDescription">{t("profile.securityRecommendation")}</p>
        </div>
        <div className="securityItem">
          <div className="securityHeader">
            <div className="securityItemTitleBox">
              <h3 className="securityItemTitle">{t("profile.securityTwoFactorVerificationTitle")}</h3>
            </div>
            <label className="toggleSwitch">
              <input type="checkbox" />
              <p className="slider"></p>
            </label>
          </div>
          <p className="securityDescription">{t("profile.securityTwoFactorVerificationText")}</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityComponent;