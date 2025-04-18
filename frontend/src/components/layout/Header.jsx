import { useState, useRef, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../../public/images/freshBalance.png";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";
import LoadingAnimation from "./LoadingAnimation.jsx";
import axios from "axios";
import "./Header.css";

const Header = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);
  const searchBoxRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const { t } = useTranslation();
  const headerData = t("header.headerData", { returnObject: true });
  const { isAuthenticated, isAdmin } = useContext(AuthContext);
  const headerNav = isAuthenticated
    ? (isAdmin ? headerData?.navAdmin : headerData?.navUser)
    : headerData?.navGuest;

  {/*--------------------------------GETTING-PRODUCTS-----------------------------------*/}
  useEffect(() => {
    const getProductsForRecommendations = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products`);
        if (response.data) {
          setAllProducts(response.data);
        }
      } 
      catch (error) {
        console.log("Error with getting products: ", error);
      } 
      finally {
        setIsLoading(false);
      }
    };

    getProductsForRecommendations();
  }, []);

  {/*--------------------------------SMALL-JS-----------------------------------*/}
  const handleFavCartLogClick = (item) => {
    if (location.pathname === item.link) {
      window.location.reload();
    } else {
      navigate(item.link);
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };

  const handleSearchBoxClick = () => {
    setIsSearchExpanded(true);
    searchInputRef.current?.focus();
    setRecommendations(headerData.recommendations.slice(0, 5));
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
    searchInputRef.current?.blur();
    setRecommendations([]);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setRecommendations(headerData.recommendations.slice(0, 5));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleSearchClose();
    } 
    else if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsSearchExpanded(false);
        setRecommendations([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*-------------------RECOMMENDATIONS------------------------*/
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    if (newQuery) {
      const filteredProducts = allProducts.filter(item =>
        item.name.toLowerCase().includes(newQuery.toLowerCase())
      );
      const combinedRecommendations = [
        newQuery,
        ...filteredProducts.map(p => p.name).filter(item => item.toLowerCase() !== newQuery.toLowerCase()),
        ...headerData.recommendations.filter(item =>
          item.toLowerCase().includes(newQuery.toLowerCase()) &&
          !filteredProducts.map(fp => fp.name.toLowerCase()).includes(item.toLowerCase()) &&
          item.toLowerCase() !== newQuery.toLowerCase()
        ),
      ].slice(0, 5);
      setRecommendations(combinedRecommendations);
    } 
    else {
      setRecommendations(headerData.recommendations.slice(0, 5));
    }
  };

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    const foundProduct = allProducts.find((product) => product.name.toLowerCase() === trimmedQuery);
    
    if (foundProduct) {
      handleSearchClose();
      const productPath = `/single-product/${foundProduct.id}`;
      
      if (location.pathname === productPath) {
        window.location.reload();
      } else {
        window.location.reload();
        navigate(productPath);
      }
      saveRecommendation(trimmedQuery);
    } 
    else {
      const targetLink = `/product/${trimmedQuery}`;
      
      if (location.pathname === targetLink) {
        window.location.reload();
      } 
      else {
        window.location.reload();
        navigate(targetLink);
        handleSearchClose();
        saveRecommendation(trimmedQuery);
      }
    }
  };

  const handleRecommendationClick = (item, e) => {
    e.stopPropagation();
    setSearchQuery(item);
    setIsSearchExpanded(false);
    const foundProduct = allProducts.find(
      (product) => product.name.toLowerCase() === item.toLowerCase()
    );

    if (foundProduct) {
      navigate(`/single-product/${foundProduct.id}`);
      saveRecommendation(item);
    }
    else {
      const targetLink = `/product/${item.toLowerCase()}`;
      navigate(targetLink);
      saveRecommendation(item);
    }

    window.location.reload();
  };

  const saveRecommendation = (term) => {
    if (term && !recommendations.map(r => r.toLowerCase()).includes(term.toLowerCase())) {
      setRecommendations(prevRecommendations => [term, ...prevRecommendations].slice(0, 5));
      console.log("Saved recommendation:", term);
    }
  };


  const displayedRecommendations = searchQuery
    ? recommendations.filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : recommendations;

  {/*------------------------------------------------MAIN--------------------------------------------------*/}
  return (
    <>
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <div className="header">
          <div className="headerBox">
            <div className={`headerColorOverlay ${isSearchExpanded ? "clicked" : ""}`} />
            <div className="headerLogoBox">
              <Link to="/" onClick={handleLogoClick}>
                <img className="headerLogo" src={logo} alt="freshBalance" />
              </Link>
              <div className="headerLanguageSwitcherBox1">
                <LanguageSwitcher />
              </div>
            </div>

            {/*--------------------------------SEARCH-BAR-----------------------------------*/}
            <div className={`headerSearchBox ${isSearchExpanded ? "clicked" : ""}`} onClick={handleSearchBoxClick} ref={searchBoxRef} >
              <div className={`headerSearchBox2 ${isSearchExpanded ? "clicked" : ""}`} onClick={handleSearchBoxClick} ref={searchBoxRef} >
                <i className="fa-solid fa-magnifying-glass" onClick={handleSearchSubmit} ></i>
                <input ref={searchInputRef} className="headerSearchBar" placeholder={t("header.searchPlaceholder")} value={searchQuery} onChange={handleInputChange} onKeyDown={handleKeyDown}/>
                <i className={`fa-solid fa-x ${isSearchExpanded ? "clicked" : ""}`} onClick={handleClearSearch} />
              </div>

              {/*--------------------------------DROP-DOWN-----------------------------------*/}
              <ul className={`headerSearchDropdown`}>
                {displayedRecommendations.map((item, index) => (
                  <li className="headerRecommendations" key={index} onClick={(e) => handleRecommendationClick(item, e)} >
                    <p className="headerRecommendation"><i className="fa-solid fa-hashtag"></i><span>{item}</span></p>
                  </li>
                ))}
              </ul>
            </div>

            {/*--------------------------------FAV-CART-LOG-----------------------------------*/}
            <ul className="headerFavCartLog">
              {headerNav.map((item, index) => (
                <li key={index} className={`headerNavElement ${location.pathname === item.link ? "active" : ""}`} onClick={() => handleFavCartLogClick(item)} >
                  <Link className="" to={item.link}>
                    {headerData.icons[item.name] && (
                      <i className={headerData.icons[item.name]}></i>
                    )}
                    <p>{item.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="headerLanguageSwitcherBox2">
              <LanguageSwitcher />
            </div>
          </div>
          <hr/>
        </div>
      )}
    </>
  );
};

export default Header;