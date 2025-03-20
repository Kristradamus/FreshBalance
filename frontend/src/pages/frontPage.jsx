import { useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {useEffect} from "react";
import "./frontPage.css";
import whoWeAre1 from "../../public/images/frontPageWhoWeAre1.jpg";
/*import whoWeAre2 from "";
import whoWeAre3 from "";
import collaborator1 from "";
import collaborator2 from "";
import collaborator3 from "";
import collaborator4 from "";
import collaborator5 from "";
import collaborator6 from "";
import collaborator7 from "";
import collaborator8 from "";
import collaborator9 from "";
import collaborator10 from "";
import collaborator11 from "";*/

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
        entry.target.classList.add("show", "animate-after");
      }
      else{
        entry.target.classList.remove("show", "animate-after");
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
      <h4 className="fPHeroSectionSubTitle hidden">{t("frontPage.heroSectionSubTitle1")}</h4>
      <button className="fPHeroSectionLearnMore hidden" onClick={() => {navigate("/about-us")}}>{t("frontPage.heroSectionLearnMore")}<i className="fa-solid fa-location-arrow"></i></button>
    </div>

{/*--------------------------------TOP-PRODUCTS--------------------------------*/}
    <div className="fPTopProducts">
      <div className="fPTopProductsTitleBox">
        <h2 className="fPTopProductsTitle1 hidden">{t("frontPage.topProductsSectionTitle1")}</h2>
      </div>
      <ul className="fPTopProductsBenefitsBox">
      {fPTopProductsData.map((item, index) => (
          <li key={index} className="fPTopProductsBenefit hidden" style={{animationDelay:`${index * 0.15}s`}}>
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
      <div className="fPWhoWeAreBox">
        <div className="fPWhoWeAreRow">
          <img src={whoWeAre1} className="fPWhoWeAreImage1 hidden"/>
          <div className="fPWhoWeAreTextBox">
            <h2 className="fPWhoWeAreTitle hidden">HOW WE ARE TRANSFORMING LIVES</h2>
            <p className="fPWhoWeAreText">At FreshBalance, we have had the honor of supporting over 500 individuals in transforming their lives through the strength of community and expert guidance. By empowering individuals to take charge of their health, we have cultivated a dynamic network committed to achieving wellness objectives. Our community consistently inspires one another, turning every milestone into a collective triumph.</p>
          </div>
        </div>
        <div className="fPWhoWeAreRow">
          <div className="fPWhoWeAreTextBox">
            <h2 className="fPWhoWeAreTitle hidden">CURATING WELLNESS SOLUTIONS</h2>
            <p className="fPWhoWeAreText">We’ve carefully selected over 100 science-backed products to meet diverse health needs. From nutritious meal options to premium supplements, our offerings are designed to support your journey toward better health and vitality.</p>
          </div>
          <img src="../../public/images/frontPageWhoWeAre3.jpeg" className="fPWhoWeAreImage3 hidden"/>
        </div>
      </div>
    </div>
{/*---------------------------------------WHO-WE-WORK-WITH--------------------------------*/}
    <div className="fPWhoWeWorkWith">
      <div className="fPWhoWeWorkWithMainBox">
      <div className="fPWhoWeWorkWithTitleBox">
        <h1 className="fPWhoWeWorkWithTitle1">Here are some of the brands we work with:</h1>
      </div>
      <div className="fPWhoWeWorkWithImageBox"/>
        <img src="../../public/images/frontPageCollaborator1.png"/>
        <img src="../../public/images/frontPageCollaborator2.png"/>
        <img src="../../public/images/frontPageCollaborator3.png"/>
        <img src="../../public/images/frontPageCollaborator4.png"/>
        <img src="../../public/images/frontPageCollaborator5.png"/>
        <img src="../../public/images/frontPageCollaborator6.png"/>
        <img src="../../public/images/frontPageCollaborator7.png"/>
        <img src="../../public/images/frontPageCollaborator8.png"/>
        <img src="../../public/images/frontPageCollaborator9.png"/>
        <img src="../../public/images/frontPageCollaborator10.png"/>
        <img src="../../public/images/frontPageCollaborator11.png"/>
        <img src="../../public/images/frontPageCollaborator12.png"/>
        <img src="../../public/images/frontPageCollaborator13.png"/>
        <img src="../../public/images/frontPageCollaborator14.png"/>
        <img src="../../public/images/frontPageCollaborator15.png"/>
        <img src="../../public/images/frontPageCollaborator16.png"/>
        <img src="../../public/images/frontPageCollaborator17.png"/>
        <img src="../../public/images/frontPageCollaborator19.png"/>
        <img src="../../public/images/frontPageCollaborator20.png"/>
        <img src="../../public/images/frontPageCollaborator21.png"/>
      </div>
    </div>
{/*---------------------------------------REVIEWS--------------------------------*/}
    <div className="fPReviews">
      <div className="fPReviewsTitleBox">
        <h1>Hear From Our Valued Clients</h1>
        <h3>Discover what others are saying about their experiences with us.</h3>
      </div>
    </div>
  </div>
);};