import React, { useState } from "react";
import "./favoritesComponent.css";
import { useTranslation } from "react-i18next";

export default function favoritesComponent() {
  const { t } = useTranslation();
  return (
    <div className="profileContentAriafavorites">
      <div className="favoritesMainTitleBox">
        <h2 className="favoritesMainTitle">{t("profile.favoritesMainTitle")}:&nbsp;</h2>
        <h2 className="favoritesMainTitleNumber">0 products</h2>
      </div>
      <div className="favoritesList"></div>
    </div>
  );
}
