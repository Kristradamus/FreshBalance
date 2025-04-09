import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./CartComponent.css";

export default function CartComponent() {
  const { t } = useTranslation();

  return (
    <div className="cart">
      <div className="cartMainList">
        <div className="cartTitleBox">
          <h2 className="cartMainTitle">{t("profile.cartMainTitle")}:&nbsp;</h2>
          <h2 className="cartMainTitleNumber">0 products</h2>
        </div>
        <div className="cartProductsBox"></div>
      </div>
      <div className="cartPaying">
        <h2>Pay Now</h2>
      </div>
    </div>
  );
}
