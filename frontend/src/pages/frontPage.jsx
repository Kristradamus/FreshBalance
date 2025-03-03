import { useState, useRef, useEffect } from "react";
import { useNavigate} from "react-router-dom";
import "./frontPage.css";
export default function FrontPage() {
  const navigate = useNavigate();

  return (
    <div className="frontPage">
      <div className="fPHeroSection">
        <h1 className="fPHeroSectionTitle1">PREMIUM NUTRITION PRODUCTS</h1>
        <h1 className="fPHeroSectionTitle2">EXPERT GUIDANCE</h1>
        <h4 className="fPHeroSectionSubTitle">Explore Over 100 Products, Connect with Personal Trainers, and Join a Thriving Community</h4>
        <button className="fPHeroSectionLearnMore" onClick={() => {navigate("/about-us")}}>Learn more</button>
    </div>
    <div className="fPTopProducts">
      <h1>CHECK SOME OF OUR TOP PRODUCTS</h1>
      <div className="fPRow1">

      </div>
      <div className="fPRow2">

      </div>
      <div className="fPRow3">
      </div>
    </div>
    <div className="fPWhoWeAre">

    </div>
    <div className="fPWhoWeWorkWith">

    </div>
    <div className="fPReviews">
      
    </div>
  </div>
  )
}
