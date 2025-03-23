import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
const [isDropdownVisible, setIsDropdownVisible] = useState(false);
const [isDropdownMoreVisible, setIsDropdownMoreVisible] = useState(false);
const [expandedSubMenuIndex, setExpandedSubMenuIndex] = useState(null);
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
  setExpandedSubMenuIndex(null);
};

const handleMoreToggle = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDropdownMoreVisible((prev) => !prev);
  setIsDropdownVisible(false);
  setExpandedSubMenuIndex(null);
};

const handleDropDownClosing = () => {
  setIsDropdownVisible(false);
  setIsDropdownMoreVisible(false);
  setExpandedSubMenuIndex(null);
}

const handleSubMenuExpansion = (index, e) => {
  e.stopPropagation();
  setIsDropdownVisible(true);
  setExpandedSubMenuIndex(prevIndex => prevIndex === index ? null : index);

}
const handleNavReload = (item) => {
  if(location.pathname === item.link){
    window.location.reload();
  }
  else{
    navigate(item.link)
  }
}

useEffect(() => {
  const handleOutsideClick = (e) => {
    const isOutsideDropdown = dropContentRef.current && !dropContentRef.current.contains(e.target) &&  catToggleRef.current &&  !catToggleRef.current.contains(e.target);                     
    const isOutsideMoreDropdown = moreDropContentRef.current &&  !moreDropContentRef.current.contains(e.target) &&  moreToggleRef.current &&  !moreToggleRef.current.contains(e.target);
    
    if (isOutsideDropdown && isOutsideMoreDropdown) {
      setIsDropdownVisible(false);
      setIsDropdownMoreVisible(false);
      setExpandedSubMenuIndex(null);
    }
  };
  
  document.addEventListener("click", handleOutsideClick);
  return () => {
    document.removeEventListener("click", handleOutsideClick);  
  };
}, []);

{/*--------------------------------------MAIN---------------------------------------------------*/}
return (
  <div className="navigation">
    <div className={`navOverlay ${isDropdownVisible || isDropdownMoreVisible ? "show" : ""}`}></div>
    <ul className="navMenu">
      <li className="navDropDown">
        <a ref={catToggleRef} className={`navCatToggle ${isDropdownVisible ? "active" : ""}`} href="#" onClick={handleCategoryToggle}>
          <i className="fa-solid fa-bars"></i> {t("navigation.categories")}
        </a>
        <ul ref={dropContentRef} className={`navDropDownContent ${isDropdownVisible ? "show" : ""}`}>
          <li className="navDropDownClosing">
            <div className="navDropDownClosingBox">
              <h3 className="navDropDownCloseTitle">Categories</h3>
              <i className="fa-solid fa-x" onClick={handleDropDownClosing}/>
            </div>
            <hr></hr>
          </li>
          {navData.categories.map((item, index) => (
            <li className={`navDropDownElement ${expandedSubMenuIndex === index ? "active" : ""}`} key={index}>
              <div className="navDropDownElementABox" onClick={(e) => handleSubMenuExpansion(index, e)}>
                <a className="navDropDownElementA" href={item.link}>{item.name}</a>
                <i className="fa-solid fa-angle-down"></i>
              </div>
              <ul className={`navSubMenu ${expandedSubMenuIndex === index ? "show" : ""}`}>
                <h2 className="navSubMenuTitle">{item.name}</h2>
                {item.category.map((subItem, subIndex) => subItem.subcategory ? (
                  <div key={subIndex}>
                    <h3 className="navSubMenuSubTitle">{subItem.title}</h3>
                    {subItem.subcategory.map((subSubItem, subSubIndex) => (
                      <li key={subSubIndex} className="navSubDropDownElement">
                        <Link to={subSubItem.link} onClick={handleNavReload}>{subSubItem.name}</Link>
                      </li>))}
                  </div>) : 
                  (<li key={subIndex} className="navSubDropDownElement">
                    <Link to={subItem.link} onClick={handleNavReload}>{subItem.name}</Link>
                  </li>
                ))}
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
          <li className="navDropDownClosing">
            <div className="navDropDownClosingBox">
              <h3 className="navDropDownCloseTitle">More</h3>
              <i className="fa-solid fa-x" onClick={handleDropDownClosing}/>
            </div>
            <hr></hr>
          </li>
          {navData.links.map((item, index) => (
            <li key={index} className="navDropDownMoreElement">
              <Link to={item.path} onClick={handleNavReload}>
                {navData.icons[item.name] && <i className={navData.icons[item.name]}></i>}
                {item.name}
              </Link>
            </li>))}
        </ul>
      </li>
      {navData.links.map((item, index) => (
        <li className="navMenuElement" key={index} ref={(el) => (linkRefs.current[index] = el)}>
          <Link className={`${location.pathname === item.path ? "active" : ""}`} to={item.path} onClick={handleNavReload}>
            {navData.icons[item.name] && <i className={navData.icons[item.name]}></i>}
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);};