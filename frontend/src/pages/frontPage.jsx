import { useNavigate} from "react-router-dom";
import { useTranslation } from "react-i18next";
import {useEffect, useState} from "react";
import LoadingAnimation from "../components/layout/LoadingAnimation.jsx";
import "./frontPage.css";

const FrontPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fPTopProductsData = t("frontPage.topProductsData", {returnObject: true});
  const [isLoading, setIsLoading] = useState(false);
  const fPWhoWeAreData = t("frontPage.whoWeAreData", {returnObject: true});

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
  /*/product/trending-now; /product/featured-products; 	
/product/new-arrivals*/
  useEffect(() => {
    const fetchTopProducts = async() => {
      try{
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/`)
      }
      catch{

      }
      finally{
        setIsLoading(false);
      }
    }
  })

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
    <>
      {isLoading ? (
        <LoadingAnimation/>
      ) : (
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
      <p>dfsgdhg</p>
            </div>
          </div>
        </div>
      
        {/*---------------------------------------WHO-WE-ARE--------------------------------*/}
        <div className="fPWhoWeAre">
          <div className="fPWhoWeAreBox">
            {fPWhoWeAreData.map((item, index) => (
              <div key={index} className="fPWhoWeAreRow">
                <img src={item.img} className={`${item.imgClassName} hidden`}/>
                <div className="fPWhoWeAreTextBox">
                  <h2 className="fPWhoWeAreTitle hidden">{item.title}</h2>
                  <p className="fPWhoWeAreText">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      
        {/*---------------------------------------WHO-WE-WORK-WITH--------------------------------*/}
        <div className="fPWhoWeWorkWith">
          <div className="fPWhoWeWorkWithMainBox">
            <div className="fPWhoWeWorkWithTitleBox">
              <h2 className="fPWhoWeWorkWithTitle1">{t("frontPage.whoWeWorkWith")}</h2>
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
        {/*<div className="fPReviews">
          <div className="fPReviewsTitleBox">
            <h1>Hear From Our Valued Clients</h1>
            <h3>Discover what others are saying about their experiences with us.</h3>
          </div>
        </div>*/}
      </div>
      )}
    </>
  );
}; 

export default FrontPage;