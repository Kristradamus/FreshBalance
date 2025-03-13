import { useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./frontPage.css";

export default function FrontPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

return (
  <div className="frontPage">
    <div className="fPHeroSection">
      <h1 className="fPHeroSectionTitle1">{t("frontPage.heroSectionTitle1")}</h1>
      <h1 className="fPHeroSectionTitle2">{t("frontPage.heroSectionTitle2")}</h1>
      <h4 className="fPHeroSectionSubTitle">{t("frontPage.heroSectionSubTitle1")}</h4>
      <button className="fPHeroSectionLearnMore" onClick={() => {navigate("/about-us")}}>{t("frontPage.heroSectionLearnMore")}<i className="fa-solid fa-location-arrow"></i></button>
    </div>
    <hr></hr>
    <div className="fPTopProducts">
      <div className="fPTopProductsTitleBox">
        <h2 className="fPTopProductsTitle1">{t("frontPage.topProductsSectionTitle1")}</h2>
      </div>
      <div className="fPRow1">

      </div>
      <div className="fPRow2">

      </div>
      <div className="fPRow3">
      </div>
    </div>
    <div className="fPWhoWeAre">
      <div className="fPWhoWeAreTitleBox">
        <h2 className="fPWhoWeAreTitle">WHO WE ARE</h2>
      </div>
    </div>
    <div className="fPWhoWeWorkWith">
      <div>

      </div>
    </div>
    <div className="fPReviews">
      
    </div>
  </div>
  )
}
