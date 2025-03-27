import React, { useState } from 'react';
import './FavouritesComponent.css';
import { useTranslation } from "react-i18next";

export default function FavouritesComponent(){
const { t } = useTranslation()
return (
  <div className="profileContentAriaFavourites">
    <div className="favouritesMainTitleBox">
      <h2 className="favouritesMainTitle">{t("profile.favouritesMainTitle")}:&nbsp;</h2>
      <h2 className="favouritesMainTitleNumber">0 products</h2>
    </div>
    <div className="favouritesList">
    </div>
  </div>
);};