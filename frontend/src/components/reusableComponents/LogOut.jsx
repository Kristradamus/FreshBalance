import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";
import "./LogOut.css";

const LogOut = () => {
  const [showAlert, setShowAlert] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const lastPublicPage = sessionStorage.getItem("lastPublicPage") || "/";
  const { t } = useTranslation();

  const handleCancelLogout = () => {
    setShowAlert(false);
    navigate(-1);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowAlert(false);
    navigate(lastPublicPage);
  };

  React.useEffect(() => {
    setShowAlert(true);
  }, []);

  return (
    <div className="logoutContainer">
      {showAlert && (
        <div className="logoutAlertOverlay">
          <div className="logoutAlert">
            <div className="logoutAlertHeader">
              <h2 className="logoutTitle">{t("profile.logoutConfirmTitle")}</h2>
              <p className="logoutSubTitle">
                {t("profile.logoutConfirmMessage")}
              </p>
            </div>
            <div className="logoutAlertButtons">
              <button className="logoutCancelButton" onClick={handleCancelLogout} >
                {t("cancel")}
              </button>
              <button className="logoutConfirmButton" onClick={handleConfirmLogout} >
                {t("profile.logoutConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogOut;