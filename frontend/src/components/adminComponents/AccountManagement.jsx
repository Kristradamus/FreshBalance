import React from "react";
import { useTranslation } from "react-i18next";

export default function AccountManagement() {
  const { t } = useTranslation();

  return (
    <div className="adminContentAreaAccounts">
      <div className="accountManagementHeader">
        <h2>{t("admin.accountsMainTitle", "Account Management")}</h2>
        <button className="addAccountBtn">
          <i className="fa-solid fa-user-plus"></i>
          {t("admin.addAccount", "Add New Account")}
        </button>
      </div>
      
      {/* ... rest of your account management code ... */}
    </div>
  );
}