import { useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {useEffect} from "react";
import "./frontPage.css";

export default function FrontPage() {
const navigate = useNavigate();
const { t } = useTranslation();
const fPTopProductsData = t("frontPage.topProductsData", {returnObject: true});

{/*-----------------------------PAGE-ANIMATION----------------------------*/}
useEffect(()=> {
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
      console.log(entry);
      if(entry.isIntersecting){
        entry.target.classList.add("show");
      }
      else{
        entry.target.classList.remove("show");
      }
  });
});
const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => observer.observe(el));

return () => {
  hiddenElements.forEach((el) => observer.unobserve(el));
};
},[]);

const fPWhoWeAreData = [
];

return (
  <div className="frontPage">
    
{/*---------------------------------HERO-SECTION-------------------------------*/}
    <div className="fPHeroSection">
      <h1 className="fPHeroSectionTitle1 hidden">{t("frontPage.heroSectionTitle1")}</h1>
      <h1 className="fPHeroSectionTitle2 hidden">{t("frontPage.heroSectionTitle2")}</h1>
      <h4 className="fPHeroSectionSubTitle">{t("frontPage.heroSectionSubTitle1")}</h4>
      <button className="fPHeroSectionLearnMore" onClick={() => {navigate("/about-us")}}>{t("frontPage.heroSectionLearnMore")}<i className="fa-solid fa-location-arrow"></i></button>
    </div>

{/*--------------------------------TOP-PRODUCTS--------------------------------*/}
    <div className="fPTopProducts">
      <div className="fPTopProductsTitleBox">
        <h2 className="fPTopProductsTitle1 hidden">{t("frontPage.topProductsSectionTitle1")}</h2>
      </div>
      <ul className="fPTopProductsBenefitsBox">
      {fPTopProductsData.map((item, index) => (
          <li key={index} className="fPTopProductsBenefit">
            <div className="fPTopProductsIconBox"><i className={item.icon}></i></div>
            <p className="fPTopProductsBenefitText">{item.text}</p>
          </li>
        ))}
      </ul>
      <div className="fPTopProductsPart1">{/*TODO:Finish the TOP PRODUCTS part of the homepage*/}
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
        <h2 className="fPWhoWeAreTitle1">WHO WE ARE</h2>
      </div>
      <div className="fPWhoWeAreTextBox">
        <div className="fPWhoWeAreTop">

        </div>
        <div className="fPWhoWeAreBottom">

        </div>
      </div>
    </div>

{/*---------------------------------------WHO-WE-WORK-WITH--------------------------------*/}
    <div className="fPWhoWeWorkWith">
      <div className="fPWhoWeWorkWithTitleBox">
        <h1 className="fPWhoWeWorkWithTitle1">Here are some of the brands we work with</h1>
        <h4></h4>
      </div>
      <div className="fPWhoWeWorkWithTextBox">

      </div>
    </div>

{/*---------------------------------------REVIEWS--------------------------------*/}
    <div className="fPReviews">
      <div className="fPReviewsTitleBox">
        <h1>Don't just take our word, see what other clients think about us</h1>
      </div>
    </div>
  </div>
);};