import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./CustomDropdown.css";

const CustomDropdown = ({options, selectedValue, onSelect, placeholder, name, disabled = false, displaySelectedLabel = false}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useTranslation();

  const getSelectedLabel = () => {
    if (selectedValue === null || selectedValue === undefined || selectedValue === "") {
      return null;
    }

    if (!options || options.length === 0) return null;

    if (typeof options[0] === 'object' && options[0] !== null) {
      const selectedOption = options.find(option => {
        return option.value !== null && option.value !== undefined &&
               option.value.toString() === selectedValue.toString();
      });
      return selectedOption?.label || null;
    }

    return options.find(option => option.toString() === selectedValue.toString()) || null;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsDropdownVisible(!isDropdownVisible);
    }
  };

  const handleSelect = (value, label) => {
    onSelect(name, value, label);
    setIsDropdownVisible(false);
  };

  const labelToDisplay = getSelectedLabel();
  const displayText = labelToDisplay !== null ? labelToDisplay : (placeholder || t("profile.checkout.select"));

  return (
    <div className="customDropdown" ref={dropdownRef}>
      <button type="button" className={`customDropdownToggle ${disabled ? "disabled" : ""} ${isDropdownVisible ? "active" : ""}`} onClick={toggleDropdown} aria-expanded={isDropdownVisible} aria-haspopup="true" disabled={disabled}>
        {displayText}
      </button>
      {isDropdownVisible && !disabled && (
        <ul className="customDropdownMenu">
          {options.length === 0 ? (
            <li className="customDropdownItem empty">{t("profile.checkout.noOptions")}</li>
          ) : (
            options.map((option, index) => {
              const value = typeof option === "object" ? option.value : option;
              const label = typeof option === "object" ? option.label : option;

              return (
                <li key={index} className="customDropdownItem" onClick={() => handleSelect(value, label)} tabIndex={0}>
                  {label}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;