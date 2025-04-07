import React from "react";
import { useTranslation } from "react-i18next";
import "./AccountManagement.css";

export default function AccountManagement() {
  const { t } = useTranslation();

  return (
    <div className="adminContentAreaAccounts">
      <div className="accountManagementHeader">
        <h2>{t("admin.accountManagementMainTitle")}</h2>
        <button className="removeAccountBtn">
          <i className="fa-solid fa-user-plus"></i>
          {t("admin.accountManagementRemoveAccount")}
        </button>
      </div>
    </div>
  );
}