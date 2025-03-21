import { useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {useEffect} from "react";
import "./frontPage.css";
import whoWeAre1 from "../../public/images/frontPageWhoWeAre1.jpg";
import whoWeAre3 from "../../public/images/frontPageWhoWeAre3.jpeg";

export default function FrontPage() {
const navigate = useNavigate();
const { t } = useTranslation();
const fPTopProductsData = t("frontPage.topProductsData", {returnObject: true});

{/*-----------------------------HOME-PAGE-DATA----------------------------*/}
const fPImagesData = [
  {src:"../../public/images/frontPageCollaborator2.png"},
  {src:"../../public/images/frontPageCollaborator3.png"},
  {src:"../../public/images/frontPageCollaborator4.png"},
  {src:"../../public/images/frontPageCollaborator5.png"},
  {src:"../../public/images/frontPageCollaborator6.png"},
  {src:"../../public/images/frontPageCollaborator7.png"},
  {src:"../../public/images/frontPageCollaborator8.png"},
  {src:"../../public/images/frontPageCollaborator9.png"},
  {src:"../../public/images/frontPageCollaborator10.png"},
  {src:"../../public/images/frontPageCollaborator11.png"},
  {src:"../../public/images/frontPageCollaborator12.png"},
  {src:"../../public/images/frontPageCollaborator13.png"},
  {src:"../../public/images/frontPageCollaborator14.png"},
  {src:"../../public/images/frontPageCollaborator15.png"},
  {src:"../../public/images/frontPageCollaborator16.png"},
  {src:"../../public/images/frontPageCollaborator17.png"},
  {src:"../../public/images/frontPageCollaborator18.png"},
]

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
      <div className="fPTopProductsPart1">
        <div className="fPTopProductsPart1Column1">
          <button>
  
          </button>
        </div>
        <div className="fPTopProductsPart1Column2">
          <div>
  
          </div>
        </div>
      </div>
      <div className="fPTopProductsPart2">
        <div className="fPTopProductsPart2Row1">
  
        </div>
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
          <img src={whoWeAre3} className="fPWhoWeAreImage3 hidden"/>
        </div>
      </div>
    </div>
  
    {/*---------------------------------------WHO-WE-WORK-WITH--------------------------------*/}
    <div className="fPWhoWeWorkWith">
      <div className="fPWhoWeWorkWithMainBox">
        <div className="fPWhoWeWorkWithTitleBox">
          <h1 className="fPWhoWeWorkWithTitle1">Here are some of the brands we work with:</h1>
        </div>
        <div className="fPWhoWeWorkWithImagesBox">
          {fPImagesData.map((item, index) => (
            <div key={index} className="fPWhoWeWorkWithImageBox hidden" style={{animationDelay:`${index * 0.10}s`}}>
              <img src={item.src} className="fPWhoWeWorkWithCollaborator" />
            </div>
          ))}
        </div>
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
  