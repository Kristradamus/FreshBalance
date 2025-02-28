import "./Footer.css";
import { Link, useNavigate } from "react-router-dom";
import React from "react";
import logo from "../images/freshBalance.png";

export default function Footer() {
  const navigate = useNavigate();

  const footerData = {
    brand: {
      logo: logo,
      name: "FreshBalance",
      description: `Fuel your life with simplicity and quality. At FreshBalance, we create science-backed nutrition products designed for your busy lifestyle. Your time matters—let us help you achieve your health goals effortlessly.`,
    },
    browse: {
      title: "Browse",
      links: [
        { name: "Home", link: "/" },
        { name: "About us", link: "/about-us" },
        { name: "Services", link: "/services" },
        { name: "Subscriptions", link: "/subscriptions" },
        { name: "Communities", link: "/communities" },
        { name: "Support", link: "/support" },
        { name: "Login", link: "/login" },
        { name: "Favourites", link: "/favourites" },
        { name: "Cart", link: "/cart" },
      ],
    },
    services: {
      title: "Services",
      items: [
        { text: "Custom Meal Plans" },
        { text: "Nutrition Coaching" },
        { text: "Supplement Guides" },
        { text: "Fitness Programs" },
        { text: "Wellness Workshops" },
        { text: "Corporate Wellness" },
      ],
    },
    contacts: {
      title: "Contacts",
      items: [
        { icon: "fa-solid fa-location-dot", text: `LevskiPrimorski, st. "Studentska" 1, 9010 Varna` },
        { icon: "fa-solid fa-envelope", text: "KrissKrastev06@gmail.com" },
        { icon: "fa-solid fa-phone", text: "+359 898 764 348" },
      ],
    },
    socialMedia: {
      title: "Social Media",
      items: [
        { icon: "fa-brands fa-instagram", link:"https://www.instagram.com/kriskrustev/"},
        { icon: "fa-brands fa-facebook-f", link:"https://www.facebook.com/kriskrustev.32/"},
        { icon: "fa-brands fa-youtube", link:"https://www.youtube.com/channel/UCjylqcGRrvzHlY-S5979iTg"},
      ],
    },
  };

  const handleFooterNavClick = (link) => {
    navigate(link);
  };

  return (
    <div className="footer">
      {/*-----------------------------------------------FOOTER-TOP--------------------------------------------*/}
      <div className="footerTop">
        <div className="footerFirstColumn">
          <img src={footerData.brand.logo} alt="FreshBalance Logo" />
          <h3>{footerData.brand.name}</h3>
          <p>{footerData.brand.description}</p>
        </div>
        <div className="footerSecondColumn">
          <h3>{footerData.browse.title}</h3>
          <ul>
            {footerData.browse.links.map((item, index) => (
              <li key={index} onClick={() => handleFooterNavClick(item.link)}>
                {item.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="footerThirdColumn">
          <h3>{footerData.services.title}</h3>
          <ul>
            {footerData.services.items.map((item, index) => (
              <li key={index}>{item.text}</li>
            ))}
          </ul>
        </div>
        <div className="footerFourthColumn">
          <h3>{footerData.contacts.title}</h3>
          <ul>
            {footerData.contacts.items.map((item, index) => (
              <li key={index}>
                <i className={item.icon}></i> {item.text}
              </li>
            ))}
          </ul>
          <h3>{footerData.socialMedia.title}</h3>
          <ul>
            {footerData.socialMedia.items.map((item, index) => (
              <li key={index}>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <i className={item.icon}></i>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/*-----------------------------------------------FOOTER-BOTTOM--------------------------------------------*/}
      <div className="footerBottom">
        <p>
          <i className="fa-regular fa-copyright"></i>2025 FreshBalance. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}


