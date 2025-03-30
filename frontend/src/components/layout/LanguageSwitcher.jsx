import { useState, useRef, useEffect } from "react";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
const [isDropdownVisible, setIsDropdownVisible] = useState(false);
const dropDownRef = useRef(null);
const { t } = useTranslation();
const languages = [
  { name: "eng", label: t("languageSwitcher.english") },
  { name: "bul", label: t("languageSwitcher.bulgarian") },
  { name: "ger", label: t("languageSwitcher.german") },
  { name: "spa", label: t("languageSwitcher.spanish") },
];

/*-----------------------------------SMALL-JS-------------------------------------------*/
const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  setIsDropdownVisible(false);
};

useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
      setIsDropdownVisible(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

return (
  <div className="languageSwitcher" ref={dropDownRef}>
    <button className="languageSwitcherToggle" onClick={() => setIsDropdownVisible(!isDropdownVisible)} aria-expanded={isDropdownVisible} aria-haspopup="true">{t("languageSwitcher.currentLanguage")}
      <span className={`languageSwitcherArrow ${isDropdownVisible ? "rotateUp" : "rotateDown"}`}>
        <i className="fa-solid fa-chevron-down"></i>
      </span>
    </button>
    <ul className={`languageSwitcherDropDown ${isDropdownVisible ? "open" : ""}`}>
      {languages.map((item, index) => (
        <li key={index} onClick={() => changeLanguage(item.name)} tabIndex={0}>
          {item.label}
        </li>
      ))}
    </ul>
  </div>
);};