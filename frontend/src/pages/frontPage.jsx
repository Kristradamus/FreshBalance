import { useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./frontPage.css";

export default function FrontPage() {
const navigate = useNavigate();
const { t } = useTranslation();


const fPTopProductsData = [
  {icon:"fa-solid fa-truck-fast", text:"Free shipping over 100lv."},
  {icon:"fa-solid fa-percent", text:"10% off orders over 200lv."},
  {icon:"fa-solid fa-leaf", text:"100% bio products"},
];
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
      <div className="fPTopProductsBenefits">
      {fPTopProductsData.map((item, index) => {
        <ul>
          <li key={index}>
            <div className="fPTopProductBenefit">
              <img src={item.icon}></img><p>{item.text}</p>
            </div>
          </li>
        </ul>
        })}
      </div>
      <div className="fPLongRow">
      </div>
      <div className="fPMiddleRow">
      </div>
      <div className="fPLongRow">
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