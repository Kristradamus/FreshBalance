import React from "react";
import { useTranslation } from "react-i18next";

// Use either this syntax:
const AdminSettings = () => {
  const { t } = useTranslation();

  return (
    <div className="adminContentAreaSettings">
      <h2>{t("admin.settingsMainTitle", "Admin Settings")}</h2>
      {/* Your settings content */}
    </div>
  );
};

export default AdminSettings; // Must include this line