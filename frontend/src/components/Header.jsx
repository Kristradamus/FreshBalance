import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import logo from "../../public/images/freshBalance.png";
import "./Header.css";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

export default function Header() {
  const navigate = useNavigate();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchInputRef = useRef(null);
  const searchBoxRef = useRef(null);
  const location = useLocation();

  const { t } = useTranslation();
  const headerData = t("header.headerData",{returnObject:true});

{/*--------------------------------SEARCH-BAR-----------------------------------*/}
  const handleFavCartLogClick = (item) => {
    navigate(item.link);
  };
  const handleSearchBoxClick = () => {
    setIsSearchExpanded(true);
    setIsDropdownVisible(true);
    searchInputRef.current?.focus();
  };
  const handleSearchClose = (e) => {
    if (e) e.stopPropagation();
    setIsSearchExpanded(false);
    setIsDropdownVisible(false);
    searchInputRef.current?.blur();
  };
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownVisible(e.target.value.length > 0);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleSearchClose(e);
    } else if (e.key === "Enter" && searchQuery.trim(e) !== "") {
      navigate(`/product-page/${e.toLowerCase()}`);
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsDropdownVisible(false);
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleClearSearch = () => {
    setSearchQuery("");
  };
  const filteredRecommendations = searchQuery
    ? [
        searchQuery,
        ...headerData.recommendations.filter(
          (item) =>
            item.toLowerCase().includes(searchQuery.toLowerCase()) &&
            item.toLowerCase() !== searchQuery.toLowerCase()
        ),
      ]
    : headerData.recommendations;

{/*------------------------------------------------MAIN--------------------------------------------------*/}
  return (
    <div className="header">
      <div className={`headerColorOverlay ${isSearchExpanded ? "clicked" : ""}`}/>
      <Link to="/">
        <img className="headerLogo" src={logo} alt="freshBalance" />
      </Link>
      {/*--------------------------------SEARCH-BAR-----------------------------------*/}
      <div className={`headerSearchBox ${isSearchExpanded ? "clicked" : ""}`} onClick={handleSearchBoxClick} ref={searchBoxRef}>
        <div className={`headerSearchBox2 ${isSearchExpanded ? "clicked" : ""}`} onClick={handleSearchBoxClick} ref={searchBoxRef}>
          <i className="fa-solid fa-magnifying-glass" onClick={() => {const trimmedQuery = searchQuery.trim().toLowerCase();
            if (trimmedQuery !== "") {
              navigate(`/product-page/${trimmedQuery}`);
            }}}>
          </i>
          <input ref={searchInputRef} className="headerSearchBar" placeholder={t("header.searchPlaceholder")} value={searchQuery} onChange={handleInputChange} onKeyDown={handleKeyDown}/>
          <i className={`fa-solid fa-x ${isSearchExpanded ? "clicked" : ""}`} onClick={handleClearSearch}/>
        </div>
        {/*--------------------------------DROP-DOWN-----------------------------------*/}
        <ul className="headerSearchDropdown">
          {filteredRecommendations.map((item, index) => (
            <li className="headerRecommendations" key={index} onClick={() => {setSearchQuery(item); navigate(`/product-page/${item.toLowerCase()}`);}}>
              <p>{item}</p>
            </li>
          ))}
        </ul>
      </div>
      {/*--------------------------------FAV-CART-LOG-----------------------------------*/}
      <ul className="headerFavCartLog">
        {headerData.nav.map((item, index) => (
          <li key={index} className={`headerNavElement ${location.pathname === item.link ? "active" : ""}`} onClick={() => handleFavCartLogClick(item)}>
            <Link to={item.link}>
              {headerData.icons[item.name] && (
                <i className={headerData.icons[item.name]}></i>
              )}
              <p>{item.name}</p>
            </Link>
          </li>
        ))}
      </ul>
      <LanguageSwitcher/>
    </div>
  );
}
