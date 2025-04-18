import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ConfirmationToast from "../../components/reusableComponents/ConfirmationToast.jsx";
import LoadingAnimation from "../../components/layout/LoadingAnimation.jsx";
import RedirectAlertForFunctions from "../../components/protectionComponents/RedirectAlertForFunctions.jsx";
import { useTranslation } from "react-i18next";
import useRemoveAddHandler from "../../components/reusableComponents/RemoveAddItems.jsx";
import axios from "axios";
import "./productPage.css";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isCategory, setIsCategory] = useState(false);
  const [lowerPrice, setLowerPrice] = useState("");
  const [upperPrice, setUpperPrice] = useState("");
  const [sortOrder, setSortOrder] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const { promotionName } = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites, handleAddToFavorites, handleAddToCart, isAddingToCart, isAddingToFavorites, isFetchingFavorites } = useRemoveAddHandler();

  /*-----------------------------------------GETTING-PRODUCTS-----------------------------------------*/
  useEffect(() => {
    setFilteredProducts([]);
    setLowerPrice("");
    setUpperPrice("");
    setSortOrder(null);
    setIsLoading(true);
    setIsCategory(false);

    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        if (!promotionName) {
          const allProducts = await fetchAllProducts();
          if (isMounted) {
            setFilteredProducts(allProducts);
          }
          return;
        }

        try {
          const categoryResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/category/${promotionName}`);

          if (categoryResponse.status >= 200 && categoryResponse.status < 300) {
            console.log(`Found ${categoryResponse.data.length} products in category`);

            setIsCategory(true);
            const processedProducts = processProducts(categoryResponse.data);

            if (isMounted) {
              setProducts(processedProducts);
              setFilteredProducts(processedProducts);
            }
          }
        } 
        catch (categoryError) {
          if (categoryError.response && categoryError.response.status === 404) {
            console.log("Category not found, loading all products for search filtering");

            setIsCategory(false);
            const allProducts = await fetchAllProducts();

            if (isMounted && promotionName) {
              filterProductsBySearchTerm(allProducts, promotionName);
            }
          } 
          else {
            console.error("Error fetching category:", categoryError);

            if (isMounted) {
              setToast({
                show: true,
                message: t("productPage.failedToLoadProducts"),
                type: "error",
              });
              setProducts([]);
              setFilteredProducts([]);
            }
          }
        }
      } 
      catch (error) {
        if (!isMounted) return;

        console.error("Error in main fetchProducts function:", error);
        setToast({
          show: true,
          message: t("productPage.failedToLoadProducts"),
          type: "error",
        });
      } 
      finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchAllProducts = async () => {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products`);
      if (!isMounted) return [];

      const processedProducts = processProducts(response.data);
      setProducts(processedProducts);
      return processedProducts;
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

    fetchProducts();

    return () => {
      isMounted = false;
      products.forEach((product) => {
        if (product.imageUrl) {
          URL.revokeObjectURL(product.imageUrl);
        }
      });
    };
  }, [promotionName, location.pathname, t]);

  /*------------------------------------SEARCH-------------------------------------*/
  const filterProductsBySearchTerm = (productsList, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") {
      setFilteredProducts(productsList);
      return;
    }

    const decodedSearchTerm = decodeURIComponent(searchTerm.replace(/-/g, " ")).trim();

    if (decodedSearchTerm === "") {
      setFilteredProducts(productsList);
      return;
    }

    const searchWords = decodedSearchTerm
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    if (searchWords.length === 0) {
      setFilteredProducts(productsList);
      return;
    }

    const filtered = productsList.filter((product) => {
      const productName = (product.name || "").toLowerCase();
      const productDescription = (product.description || "").toLowerCase();
      const productCategories = (product.categories || "").toLowerCase();

      return searchWords.some((word) => productName.includes(word) || productDescription.includes(word) || productCategories.includes(word));
    });

    setFilteredProducts(filtered);
    console.log(`Filtered ${filtered.length} products out of ${productsList.length} by search: "${decodedSearchTerm}"`);
  };

  /*--------------------------------------GET-DISPLAY-NAME-------------------------------------*/
  const getDisplayName = () => {
    const categoryNameFromNav = location.state?.categoryName;
    
    if (categoryNameFromNav) {
      return categoryNameFromNav;
    }
    
    if (!promotionName) return t("productPage.allProducts");

    if (isCategory) {
      return promotionName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else {
      const decodedSearchTerm = decodeURIComponent(promotionName.replace(/-/g, " "));
      return `„${decodedSearchTerm}"`;
    }
  };

  /*-------------------------------------PRODUCT-CLICK-------------------------------------*/
  const handleProductClick = (productOrId) => {
    const productId = typeof productOrId === "object" && productOrId !== null ? productOrId.id : productOrId;

    if (productId) {
      navigate(`/single-product/${productId}`);
    } 
    else {
      console.error("Invalid product ID for navigation:", productOrId);
    }
  };

  /*--------------------------------------FILTERING---------------------------------------*/
  const applyFilters = () => {
    let currentProducts = [...products];

    if (!isCategory && promotionName) {
      filterProductsBySearchTerm(currentProducts, promotionName);
      return;
    }

    let filtered = currentProducts;

    if (lowerPrice !== "" || upperPrice !== "") {
      filtered = filtered.filter((product) => {
        const price = product.price;
        const lowerBound = lowerPrice !== "" ? Number(lowerPrice) : 0;
        const upperBound = upperPrice !== "" ? Number(upperPrice) : Infinity;

        return price >= lowerBound && price <= upperBound;
      });
    }

    if (sortOrder === "lowToHigh") {
      filtered.sort((a, b) => a.price - b.price);
    } 
    else if (sortOrder === "highToLow") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  };

  const handlePriceChange = (e, type) => {
    const value = e.target.value;

    if (value === "" || Number(value) >= 0) {
      if (type === "lower") {
        setLowerPrice(value);
      } 
      else {
        setUpperPrice(value);
      }
    }
  };

  const handleSortToggle = (newSortOrder) => {
    setSortOrder(sortOrder === newSortOrder ? null : newSortOrder);
  };

  useEffect(() => {
    if (products.length > 0) {
      applyFilters();
    }
  }, [lowerPrice, upperPrice, sortOrder, products]);

  useEffect(() => {
    if (!isCategory && promotionName && products.length > 0) {
      filterProductsBySearchTerm(products, promotionName);
    }
  }, [isCategory, products]);

  return (
    <>
      {isLoading ? (
        <LoadingAnimation/>
      ) : (
        <div className="productPage">
          <ConfirmationToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "", type: "" })} />
          <RedirectAlertForFunctions show={showAlert} onClose={() => setShowAlert(false)} />
    
          {/*------------------------------------------FILTRATION------------------------------------------*/}
          <div className="productFilters">
            <h2 className="filtersTitle">{t("productPage.filtration")}: </h2>
            <hr/>
            <h3 className="filtersTitlePrice">{t("productPage.price")}: </h3>
            <div className="priceFilterBox">
              <div className="priceFilterInputs">
                <input className="priceInput" placeholder="0.00" type="number" min="0" value={lowerPrice} onChange={(e) => handlePriceChange(e, "lower")} />
                <p>-</p>
                <input className="priceInput" placeholder="0.00" type="number" min="0" value={upperPrice} onChange={(e) => handlePriceChange(e, "upper")} />
              </div>
              <div className="priceCheckboxBox" onClick={() => handleSortToggle("lowToHigh")}>
                <input type="checkbox" className="priceCheckbox" checked={sortOrder === "lowToHigh"} onChange={() => {}} />
                <div>
                  <p className="priceCheckboxText">{t("productPage.lowToHigh")}</p>
                </div>
              </div>
              <div className="priceCheckboxBox" onClick={() => handleSortToggle("highToLow")}>
                <input type="checkbox" className="priceCheckbox" checked={sortOrder === "highToLow"} onChange={() => {}} />
                <div>
                  <p className="priceCheckboxText">{t("productPage.highToLow")}</p>
                </div>
              </div>
            </div>
          </div>
    
          {/*------------------------------------------HEADER------------------------------------------*/}
          <main className="pPMain">
            <header className="pPMainHeader">
              <h2>
                {getDisplayName()}:{" "}
                <span className="pPProductCount">
                  {filteredProducts.length} {filteredProducts.length === 1 ? t("productPage.product") : t("productPage.products")}
                </span>
              </h2>
            </header>
    
            {/*------------------------------------------MAIN------------------------------------------*/}
            {(isLoading || isFetchingFavorites) ? (
              <div className="loading"></div>
            ) : filteredProducts.length > 0 ? (
              <div className="pPProductGrid">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="pPProductCard">
                    <div className="pPImageContainer" onClick={() => handleProductClick(product.id)}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="pPProductImage" loading="lazy" onError={(e) => {   console.error("Image failed to load for product:", product.id);   e.target.style.display = "none"; }} />
                      ) : (
                        <h3 className="pPImagePlaceholder">
                          <i className="fa-solid fa-camera"></i> {t("productPage.noProductImage")}
                        </h3>
                      )}
                      <button className="wishlistButton" onClick={(e) => handleAddToFavorites(e, product.id, setToast, t, setShowAlert)} disabled={isAddingToFavorites}>
                        <i className={`fa-heart ${favorites.includes(product.id) ? "fa-solid active" : "fa-regular"}`}></i>
                      </button>
                    </div>
                    <div className="pPProductInfo">
                      <h4 className="pPProductTitle">{product.name}</h4>
                      <div className="pPProductFooter">
                        <p className="pPProductPrice">
                          {product.price} {t("productPage.lv")}.
                        </p>
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
            ) : (
              <div className="noProducts">
                <h2>{t("productPage.sorryWeDontHaveIt")}</h2>
                {!isCategory && promotionName && (
                  <p>
                    {t("productPage.noProductsMatch")}: „{decodeURIComponent(promotionName.replace(/-/g, " "))}“
                  </p>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </>
  );
};

export default ProductPage;
