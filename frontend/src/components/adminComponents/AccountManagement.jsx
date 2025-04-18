import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./AccountManagement.css";

const AccountManagement = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  const handleBtnClick = () => {
    setShow(!show);
  }

  return (
    <div className="adminContentAreaAccounts">
      <div className="accountManagementHeader">
        <h2>{t("admin.accountManagement.mainTitle")}</h2>
        <button className={`removeAccountBtn ${show ? "show" : ""}`} onClick={handleBtnClick}>
          <i className="fa-solid fa-user-minus"></i>
          {t("admin.accountManagement.removeAccount")}
        </button>
      </div>
      {show && (
        <div className="removeAccountMain">
          <h2>sfdgsdg</h2>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;