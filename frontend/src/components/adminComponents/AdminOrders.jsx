import React from "react";
import { useTranslation } from "react-i18next";

// Make sure to use default export
const AdminOrders = () => {
  const { t } = useTranslation();

  return (
    <div className="adminContentAreaOrders">
      <h2>{t("admin.ordersMainTitle", "Order Management")}</h2>
      {/* Your orders content */}
    </div>
  );
};

export default AdminOrders; // This is crucial