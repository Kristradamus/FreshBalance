import { useTranslation } from 'react-i18next';
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isDropdownMoreVisible, setIsDropdownMoreVisible] = useState(false);
  const catToggleRef = useRef(null);
  const moreToggleRef = useRef(null);
  const dropContentRef = useRef(null);
  const moreDropContentRef = useRef(null);
  const linkRefs = useRef([]);
  const location = useLocation();

  const { t } = useTranslation();
  const navData = t("navigation.navData", {returnObject:true});

  {/*--------------------------------------DROP-DOWN---------------------------------------------------*/}
  const handleCategoryToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownVisible((prev) => !prev);
    setIsDropdownMoreVisible(false);
  };
  const handleMoreToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownMoreVisible((prev) => !prev);
    setIsDropdownVisible(false);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if ((dropContentRef.current && !dropContentRef.current.contains(e.target) && catToggleRef.current && !catToggleRef.current.contains(e.target)) ||
      (moreDropContentRef.current && !moreDropContentRef.current.contains(e.target) && moreToggleRef.current && !moreToggleRef.current.contains(e.target))){
        setIsDropdownVisible(false);
        setIsDropdownMoreVisible(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {document.removeEventListener("click", handleOutsideClick);};}, []);

{/*--------------------------------------MAIN---------------------------------------------------*/}
  return (
    <div className="navigation">
      <ul className="navMenu">
        <li className="navDropDown">
          <a ref={catToggleRef} className={`navCatToggle ${isDropdownVisible ? "active" : ""}`} href="#" onClick={handleCategoryToggle}>
            <i className="fa-solid fa-bars"></i> {t("navigation.categories")}
          </a>
          <ul ref={dropContentRef} className={`navDropDownContent ${isDropdownVisible ? "show" : ""}`}>
            {navData.categories.map((category, index) => (
              <li className="navDropDownElement"key={index}>
                <a className="navDropDownElementA" href={category.link}>{category.name}</a>
                <ul className="navSubMenu">
                  <h2>{category.name}</h2>
                  {category.subcategories.map((subCategory, subIndex) => subCategory.items ? (
                  <div key={subIndex}>
                    <h3>{subCategory.title}</h3>
                    {subCategory.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <Link to={item.link}>{item.name}</Link>
                    </li>))}
                  </div>) : 
                  (<li key={subIndex}>
                    <Link to={subCategory.link}>{subCategory.name}</Link>
                  </li>))}
                </ul>
              </li>
            ))}
          </ul>
        </li>
{/*--------------------------------------MAIN-NAVIGATION-LINKS-------------------------------------------------*/}
        <li className="navMore">
          <a ref={moreToggleRef} className="navCatToggle" href="#" onClick={handleMoreToggle}>
            {t("navigation.more")}
          </a>
          <ul ref={moreDropContentRef} className={`navDropDownMore ${isDropdownMoreVisible ? "show" : ""}`}>
          {navData.links.map((item, index) => (
            <li key={index}>
              <Link to={item.path}>
                {navData.icons[item.name] && <i className={navData.icons[item.name]}></i>}
                {item.name}
              </Link>
            </li>))}
          </ul>
        </li>
        {navData.links.map((item, index) => (
        <li className="navMenuElement" key={index} ref={(el) => (linkRefs.current[index] = el)}>
        <Link className={`${location.pathname === item.path ? "active" : ""}`} to={item.path}>
        {navData.icons[item.name] && <i className={navData.icons[item.name]}></i>}
        {item.name}
        </Link>
        </li>
        ))}
      </ul>
    </div>
  );
}