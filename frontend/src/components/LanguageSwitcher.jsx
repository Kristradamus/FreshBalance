import React, { useState, useRef, useEffect } from "react";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropDownRef = useRef(null);

  const languages = [
    { name: "eng", label: t("languageSwitcher.english") },
    { name: "bul", label: t("languageSwitcher.bulgarian") },
    { name: "ger", label: t("languageSwitcher.german") },
    { name: "spa", label: t("languageSwitcher.spanish") },
    { name: "jap", label: t("languageSwitcher.japanese") },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsDropdownVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };
    if (isDropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownVisible]);

  return (
    <div className="languageSwitcher">
      <button className="languageSwitcherToggle" onClick={() => setIsDropdownVisible(!isDropdownVisible)} aria-expanded={isDropdownVisible} aria-haspopup="true">
        {t("languageSwitcher.currentLanguage")} {/* Display current language */}
        <span className="arrow">{isDropdownVisible ? "▲" : "▼"}</span>
      </button>
      {isDropdownVisible && (
        <ul className="languageSwitcherDropDown">
          {languages.map((item, index) => (
            <li
              key={index}
              onClick={() => changeLanguage(item.name)}
              role="menuitem"
              tabIndex={0}
              onKeyPress={(e) => e.key === "Enter" && changeLanguage(item.name)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}