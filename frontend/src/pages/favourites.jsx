import { useTranslation } from "react-i18next";
import "./favourites.css"

export default function Favourites() {
  const { t } = useTranslation();
  return (
    <div className="favourites">
      <div className="favouritesSideBar">
        {t("")}
      </div>
      <div className="favouritesMain">
        
      </div>
    </div>
  )
}
