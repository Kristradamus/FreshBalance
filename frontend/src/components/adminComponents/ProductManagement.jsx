import React from "react";
import { useTranslation } from "react-i18next";

export default function ProductManagement() {
  const { t } = useTranslation();

  return (
    <div className="adminContentAreaProducts">
      <div className="productManagementHeader">
        <h2>{t("admin.productsMainTitle", "Product Management")}</h2>
        <button className="addProductBtn">
          <i className="fa-solid fa-plus"></i>
          {t("admin.addProduct", "Add New Product")}
        </button>
      </div>
      
    </div>
  );
}