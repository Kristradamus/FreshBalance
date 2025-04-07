import React from "react";
import { useTranslation } from "react-i18next";
import "./AdminSettings.css";

const AdminSettings = () => {
  const { t } = useTranslation();

  return (
    <div className="adminContentAreaSettings">
      <h2>{t("admin.settingsMainTitle")}</h2>
      <div className="adminSettings">
      </div>
    </div>
  );
};

export default AdminSettings;