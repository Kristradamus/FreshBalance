import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext.jsx";
import "./LogOut.css";

export default function LogOut() {
  const [showAlert, setShowAlert] = useState(false); // Initialize as false
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCancelLogout = () => {
    setShowAlert(false);
    navigate(-1); // Go back to previous page
  };

  const handleConfirmLogout = () => {
    logout();
    setShowAlert(false);
    navigate('/login');
  };

  // This will show when mounted (since it's on its own route)
  React.useEffect(() => {
    setShowAlert(true);
  }, []);

  return (
    <div className="logout-container">
      {/* Custom Alert Dialog - always shown when this component mounts */}
      {showAlert && (
        <div className="logout-alert-overlay">
          <div className="logout-alert">
            <div className="logout-alert-header">
              <i className="fa-solid fa-triangle-exclamation warning-icon"></i>
              <h3>{t("profile.logoutConfirmTitle") || "Confirm Logout"}</h3>
            </div>
            <p>{t("profile.logoutConfirmMessage") || "Are you sure you want to log out?"}</p>
            <div className="logout-alert-buttons">
              <button 
                className="cancel-button" 
                onClick={handleCancelLogout}
              >
                {t("profile.cancel") || "Cancel"}
              </button>
              <button 
                className="confirm-button" 
                onClick={handleConfirmLogout}
              >
                {t("profile.confirm") || "Yes, Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}