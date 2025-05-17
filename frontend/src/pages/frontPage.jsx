import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import LoadingAnimation from "../components/layout/LoadingAnimation.jsx";
import useRemoveAddHandler from "../components/reusableComponents/RemoveAddItems.jsx";
import ConfirmationToast from "../components/reusableComponents/ConfirmationToast.jsx";
import RedirectAlertForFunctions from "../components/protectionComponents/RedirectAlertForFunctions.jsx";
import axios from "axios";
import "./frontPage.css";

export default function FrontPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const fPTopProductsData = t("frontPage.topProductsData", { returnObject: true });
  const fPWhoWeAreData = t("frontPage.whoWeAreData", { returnObject: true });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [productGroups, setProductGroups] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { favorites, handleAddToFavorites, handleAddToCart, isAddingToCart, isAddingToFavorites, isFetchingFavorites } = useRemoveAddHandler();
  const [currentSlides, setCurrentSlides] = useState({});
  const sliderIntervals = useRef({});
  const sliderRefs = useRef({});
  const productsPerCategory = 7;
  const visibleProductsCount = 5;
  const frontPageCategories = t("frontPage.topProductsRows", { returnObject: true });

  const fPImagesData = [
    { src: "../../public/images/frontPageCollaborator2.png" },
    { src: "../../public/images/frontPageCollaborator3.png" },
    { src: "../../public/images/frontPageCollaborator4.png" },
    { src: "../../public/images/frontPageCollaborator5.png" },
    { src: "../../public/images/frontPageCollaborator6.png" },
    { src: "../../public/images/frontPageCollaborator7.png" },
    { src: "../../public/images/frontPageCollaborator8.png" },
    { src: "../../public/images/frontPageCollaborator9.png" },
    { src: "../../public/images/frontPageCollaborator10.png" },
    { src: "../../public/images/frontPageCollaborator11.png" },
    { src: "../../public/images/frontPageCollaborator12.png" },
    { src: "../../public/images/frontPageCollaborator13.png" },
    { src: "../../public/images/frontPageCollaborator14.png" },
    { src: "../../public/images/frontPageCollaborator15.png" },
    { src: "../../public/images/frontPageCollaborator16.png" },
    { src: "../../public/images/frontPageCollaborator17.png" },
    { src: "../../public/images/frontPageCollaborator18.png" },
  ];

  /*--------------------------LOAD-PRODUCTS-----------------------------*/
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setIsLoading(true);
        const categoryRequests = frontPageCategories.map(category =>
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/category/${category.link}`)
        );

        const categoryResponses = await Promise.all(categoryRequests);

        const newProductGroups = {};
        const initialSlides = {};
        
        frontPageCategories.forEach((category, index) => {
          let products = categoryResponses[index].data;
          products = processProducts(products);
          
          if (products.length > 0 && products.length < productsPerCategory) {
            const repeatedProducts = [];
            let i = 0;
            while (repeatedProducts.length < productsPerCategory) {
              repeatedProducts.push({
                ...products[i % products.length],
                key: `${products[i % products.length].id}-${Math.floor(i / products.length)}`
              });
              i++;
            }
            newProductGroups[category.link] = repeatedProducts;
          } 
          else if (products.length > productsPerCategory) {
            newProductGroups[category.link] = products.slice(0, productsPerCategory);
          }
          else {
            newProductGroups[category.link] = products;
          }
          
          initialSlides[category.link] = 0;
        });
        
        setProductGroups(newProductGroups);
        setCurrentSlides(initialSlides);
      } 
      catch (error) {
        console.error("There is an error:", error);
      } 
      finally {
        setIsLoading(false);
      }
    };

    const processProducts = (data) => {
      return data.map((product) => {
        if (product.image && product.image.data) {
          return {
            ...product,
            imageUrl: `data:image/jpeg;base64,${product.image.data}`,
          };
        }
        return product;
      });
    };

    fetchTopProducts();
  }, []);

  /*----------------------ANIMATION------------------------*/
  useEffect(() => {
    if (isLoading) return;

    const resetAnimations = () => {
      const hiddenElements = document.querySelectorAll(".hidden");
      hiddenElements.forEach(el => {
        el.classList.remove("show");
      });
    };

    const initializeAnimations = () => {
      setTimeout(() => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
            } 
            else {
              entry.target.classList.remove("show");
            }
          });
        }, {
          threshold: 0.1
        });

        const hiddenElements = document.querySelectorAll(".hidden");
        
        hiddenElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const isVisible = (
            rect.top <= window.innerHeight &&
            rect.bottom >= 0
          );
          
          if (isVisible) {
            el.classList.add("show");
          }
          observer.observe(el);
        });
        
        return () => {
          hiddenElements.forEach((el) => observer.unobserve(el));
        };
      }, 100);
    };

    resetAnimations();
    initializeAnimations();

  }, [isLoading, location.key]);

  /*-----------------------SLIDING--------------------*/
  useEffect(() => {
    const initializeSliders = () => {
      Object.keys(sliderIntervals.current).forEach(key => {
        clearInterval(sliderIntervals.current[key]);
      });

      frontPageCategories.forEach(category => {
        const products = productGroups[category.link];
        if (products && products.length > 0) {
          sliderIntervals.current[category.link] = setInterval(() => {
            nextSlide(category.link);
          }, 5000);
        }
      });
    };

    if (!isLoading && Object.keys(productGroups).length > 0) {
      initializeSliders();
    }

    return () => {
      Object.keys(sliderIntervals.current).forEach(key => {
        clearInterval(sliderIntervals.current[key]);
      });
    };
  }, [productGroups, isLoading]);

  /*---------------------------PRODUCT-CLICK----------------------------*/
  const handleProductClick = (productOrId) => {
    const productId = typeof productOrId === "object" && productOrId !== null ? productOrId.id : productOrId;

    if (productId) {
      navigate(`/single-product/${productId}`);
    } 
    else {
      console.error("Invalid product ID for navigation:", productOrId);
    }
  };

  /*------------------------------SLIDER----------------------------------*/
  const getVisibleProducts = (categoryLink) => {
    const products = productGroups[categoryLink];
    if (!products || products.length === 0) return [];
    
    const currentIndex = currentSlides[categoryLink] || 0;
    
    const startIndex = currentIndex;
    const endIndex = startIndex + visibleProductsCount;
    
    const circularProducts = [...products];
    
    const visibleProducts = [];
    for (let i = startIndex; i < endIndex; i++) {
      const index = i % products.length;
      visibleProducts.push({
        ...circularProducts[index],
        key: `${circularProducts[index].id}-${Math.floor(i / products.length)}`
      });
    }
    
    return visibleProducts;
  };

  const nextSlide = (categoryLink) => {
    const products = productGroups[categoryLink];
    if (!products || products.length === 0) return;
    
    setCurrentSlides(prev => {
      let nextIndex = (prev[categoryLink] || 0) + 1;
      if (nextIndex >= products.length) {
        nextIndex = 0;
      }
      return { ...prev, [categoryLink]: nextIndex };
    });
  };

  const prevSlide = (categoryLink) => {
    const products = productGroups[categoryLink];
    if (!products || products.length === 0) return;
    
    setCurrentSlides(prev => {
      let prevIndex = (prev[categoryLink] || 0) - 1;
      if (prevIndex < 0) {
        prevIndex = products.length - 1;
      }
      return { ...prev, [categoryLink]: prevIndex };
    });
  };

  const handleNextSlide = (categoryLink, e) => {
    e.stopPropagation();
    
    nextSlide(categoryLink);
    
    clearInterval(sliderIntervals.current[categoryLink]);
    sliderIntervals.current[categoryLink] = setInterval(() => {
      nextSlide(categoryLink);
    }, 5000);
  };

  const handlePrevSlide = (categoryLink, e) => {
    e.stopPropagation();
    
    prevSlide(categoryLink);
    
    clearInterval(sliderIntervals.current[categoryLink]);
    sliderIntervals.current[categoryLink] = setInterval(() => {
      nextSlide(categoryLink);
    }, 5000);
  };

  const goToSlide = (categoryLink, slideIndex, e) => {
    e.stopPropagation();
    
    const products = productGroups[categoryLink];
    if (!products || products.length === 0) return;

    const validIndex = Math.max(0, Math.min(slideIndex, products.length - 1));
    
    setCurrentSlides(prev => ({ ...prev, [categoryLink]: validIndex }));
    
    clearInterval(sliderIntervals.current[categoryLink]);
    sliderIntervals.current[categoryLink] = setInterval(() => {
      nextSlide(categoryLink);
    }, 5000);
  };

  const handleMouseEnter = (categoryLink) => {
    clearInterval(sliderIntervals.current[categoryLink]);
  };

  const handleMouseLeave = (categoryLink) => {
    const products = productGroups[categoryLink];
    if (!products || products.length === 0) return;
    
    sliderIntervals.current[categoryLink] = setInterval(() => {
      nextSlide(categoryLink);
    }, 5000);
  };

  const getPaginationDots = (categoryLink) => {
    const products = productGroups[categoryLink];
    if (!products || products.length <= visibleProductsCount) return [];
    
    const dotCount = Math.min(products.length, 7);
    return Array.from({ length: dotCount });
  };

  return (
    <>
      {(isLoading || isFetchingFavorites) ? (
        <LoadingAnimation />
      ) : (
        <div className="frontPage">
          <ConfirmationToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({show:false, message:"", type:""})}/>
          <RedirectAlertForFunctions show={showAlert} onClose={() => setShowAlert(false)} />

          {/*--------------------HERO-SECTION----------------------*/}
          <div className="fPHeroSection">
            <h1 className="fPHeroSectionTitle1 hidden">{t("frontPage.heroSectionTitle1")}</h1>
            <h1 className="fPHeroSectionTitle2 hidden">{t("frontPage.heroSectionTitle2")}</h1>
            <h4 className="fPHeroSectionSubTitle hidden">{t("frontPage.heroSectionSubTitle1")}</h4>
            <button className="fPHeroSectionLearnMore hidden" onClick={() => { navigate("/about-us") }}>{t("frontPage.heroSectionLearnMore")}<i className="fa-solid fa-location-arrow"></i></button>
          </div>

          {/*--------------------TOP-PRODUCTS----------------------*/}
          <div className="fPTopProducts">
            <div className="fPTopProductsTitleBox">
              <h2 className="fPTopProductsTitle1 hidden">{t("frontPage.topProductsSectionTitle1")}</h2>
            </div>
            <ul className="fPTopProductsBenefitsBox">
              {fPTopProductsData.map((item, index) => (
                <li key={index} className="fPTopProductsBenefit hidden" style={{ animationDelay: `${index * 0.15}s` }}>
                  <div className="fPTopProductsIconBox"><i className={item.icon}></i></div>
                  <p className="fPTopProductsBenefitText">{item.text}</p>
                </li>
              ))}
            </ul>
            <div className="fPTopProductsRows">
              {frontPageCategories.map((category) => (
                <div key={category.link} className="fPTopProductsRowBox">
                  <div className="fPTopProductsCategoryTitle">
                    <h2 className="categoryTitle">{category.displayName}:</h2>
                  </div>
                  {productGroups[category.link] && productGroups[category.link].length > 0 && (
                    <div className="fPProductsRowContainer" onMouseEnter={() => handleMouseEnter(category.link)} onMouseLeave={() => handleMouseLeave(category.link)}ref={el => sliderRefs.current[category.link] = el}>
                      <div className="fPProductsRowSubContainer">
                        <button className="sliderArrow Prev" onClick={(e) => handlePrevSlide(category.link, e)}>
                          <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <div className="sliderTrack">
                          {getVisibleProducts(category.link).map((product) => (
                            <article key={product.key || product.id} className="pPProductCard hidden slider-item">
                              <div className="pPImageContainer" onClick={() => handleProductClick(product.id)}>
                                {product.imageUrl ? (
                                  <img src={product.imageUrl} alt={product.name} className="pPProductImage" loading="lazy" onError={(e) => {  console.error("Image failed to load for product:", product.id);  e.target.style.display = "none";}} />
                                ) : (
                                  <h3 className="pPImagePlaceholder">
                                    <i className="fa-solid fa-camera"></i> {t("productPage.noProductImage")}
                                  </h3>
                                )}
                                <button className="wishlistButton"  onClick={(e) => handleAddToFavorites(e, product.id, setToast, t, setShowAlert)}  disabled={isAddingToFavorites === product.id}>
                                  <i className={`fa-heart ${favorites.includes(product.id) ? "fa-solid active" : "fa-regular"}`}></i>
                                </button>
                              </div>
                              <div className="pPProductInfo">
                                <h4 className="pPProductTitle">{product.name}</h4>
                                <div className="pPProductFooter">
                                  <p className="pPProductPrice">{product.price} {t("productPage.lv")}.</p>
                                  <button className="pPAddToCart" onClick={(e) => handleAddToCart(e, product.id, setToast, t, setShowAlert)} disabled={isAddingToCart === product.id}>
                                    {isAddingToCart === product.id ? (
                                      <span><i className="fa-solid fa-cart-shopping"></i>{t("productPage.addingToCart") + "..."}</span>
                                    ) : (
                                      <span><i className="fa-solid fa-cart-shopping"></i>{t("productPage.addToCart")}</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                        <button className="sliderArrow Next" onClick={(e) => handleNextSlide(category.link, e)} aria-label="Next products" >
                          <i className="fa-solid fa-chevron-right"></i>
                        </button>
                      </div>
                      {productGroups[category.link] && productGroups[category.link].length > visibleProductsCount && (
                        <div className="sliderPagination">
                          {getPaginationDots(category.link).map((_, index) => (
                            <button  key={index} className={`paginationDot ${currentSlides[category.link] === index ? 'active' : ''}`} onClick={(e) => goToSlide(category.link, index, e)} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/*-------------------WHO-WE-ARE-------------------*/}
          <div className="fPWhoWeAre">
            <div className="fPWhoWeAreBox">
              {fPWhoWeAreData.map((item, index) => (
                <div key={index} className="fPWhoWeAreRow">
                  <img src={item.img} className={`${item.imgClassName} hidden`} />
                  <div className="fPWhoWeAreTextBox">
                    <h2 className="fPWhoWeAreTitle hidden">{item.title}</h2>
                    <p className="fPWhoWeAreText">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/*-------------------WHO-WE-WORK-WITH--------------*/}
          <div className="fPWhoWeWorkWith">
            <div className="fPWhoWeWorkWithMainBox">
              <div className="fPWhoWeWorkWithTitleBox">
                <h2 className="fPWhoWeWorkWithTitle1">{t("frontPage.whoWeWorkWith")}</h2>
              </div>
              <div className="fPWhoWeWorkWithImagesBox">
                {fPImagesData.map((item, index) => (
                  <div key={index} className="fPWhoWeWorkWithImageBox hidden" style={{ animationDelay: `${index * 0.10}s` }}>
                    <img src={item.src} className="fPWhoWeWorkWithCollaborator" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/*-----------------------REVIEWS--------------------------*/}
          {/* Reviews section unchanged */}
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
}