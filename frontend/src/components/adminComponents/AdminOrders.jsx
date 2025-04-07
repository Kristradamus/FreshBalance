import React from "react";
import { useTranslation } from "react-i18next";
import "./AdminOrders.css";

const AdminOrders = () => {
  const { t } = useTranslation();

  return (
    <div className="adminContentAreaOrders">
      <h2>{t("admin.ordersMainTitle")}</h2>
    </div>
  );
};

export default AdminOrders;