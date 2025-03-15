import { useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./frontPage.css";

export default function FrontPage() {
const navigate = useNavigate();
const { t } = useTranslation();
const fPTopProductsData = t("frontPage.topProductsData", {returnObject: true});

const fPWhoWeAreData = [


];

return (
 <div className="frontPage">
{/*---------------------------------HERO-SECTION-------------------------------*/}
    <div className="fPHeroSection">
      <h1 className="fPHeroSectionTitle1">{t("frontPage.heroSectionTitle1")}</h1>
      <h1 className="fPHeroSectionTitle2">{t("frontPage.heroSectionTitle2")}</h1>
      <h4 className="fPHeroSectionSubTitle">{t("frontPage.heroSectionSubTitle1")}</h4>
      <button className="fPHeroSectionLearnMore" onClick={() => {navigate("/about-us")}}>{t("frontPage.heroSectionLearnMore")}<i className="fa-solid fa-location-arrow"></i></button>
    </div>
{/*--------------------------------TOP-PRODUCTS--------------------------------*/}
    <div className="fPTopProducts">
      <div className="fPTopProductsTitleBox">
        <h2 className="fPTopProductsTitle1">{t("frontPage.topProductsSectionTitle1")}</h2>
      </div>
      <ul className="fPTopProductsBenefitsBox">
      {fPTopProductsData.map((item, index) => (
          <li key={index} className="fPTopProductsBenefit">
            <div className="fPTopProductsIconBox"><i className={item.icon}></i></div>
            <p className="fPTopProductsBenefitText">{item.text}</p>
          </li>
        ))}
      </ul>
      <div className="fPTopProductsPart1">
        <div className="fPTopProductsPart1Column1">
          <button></button>
        </div>
        <div className="fPTopProductsPart1Column2">
          <div>

          </div>
        </div>
      </div>
      <div className="fPTopProductsPart2">
      </div>
    </div>
{/*---------------------------------------WHO-WE-ARE--------------------------------*/}
    <div className="fPWhoWeAre">
      <div className="fPWhoWeAreTitleBox">
        <h2 className="fPWhoWeAreTitle">WHO WE ARE</h2>
      </div>
      <div className="fPWhoWeAreBigBox">
      </div>
      <h4 className="fPWhoWeAreSubTitle1">Learn more about our ways from the deeds we have committed</h4>
      <div className="fPWhoWeAreTop"></div>
    </div>
   <div className="fPWhoWeWorkWith">
    <div>
      <div className="fPWhoWeWorkWithTitle1">
        <h1>Here are some of the brands we work with</h1>
        <h4></h4>
      </div>
    </div>
  </div>
  <div className="fPReviews">
    <div className="fPReviewsTitleBox">
      <h1>Don't just take our word, see what other clients think about us</h1>
    </div>
  
  </div>
</div>
);};