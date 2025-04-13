import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConfirmationToast from "../../components/reusableComponents/ConfirmationToast.jsx";
import RedirectAlertForFunctions from "../../components/protectionComponents/RedirectAlertForFunctions.jsx";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../components/protectionComponents/AuthContext.jsx";
import axios from "axios";
import "./productPage.css";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isCategory, setIsCategory] = useState(false);
  const [lowerPrice, setLowerPrice] = useState("");
  const [upperPrice, setUpperPrice] = useState("");
  const [sortOrder, setSortOrder] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);
  const { promotionName } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  /*-----------------------------------------GETTING-PRODUCTS-----------------------------------------*/
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        if (!promotionName) {
          await fetchAllProducts();
          return;
        }

        try {
          const categoryResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/category/${promotionName}`, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });

          if (categoryResponse.status >= 200 && categoryResponse.status < 300) {
            console.log(`Found ${categoryResponse.data.length} products in category`);
            setIsCategory(true);
            processAndSetProducts(categoryResponse.data);
          }
        } catch (categoryError) {
          if (categoryError.response && categoryError.response.status === 404) {
            console.log("Category not found, loading all products for search filtering");
            setIsCategory(false);
            await fetchAllProducts();
          } else {
            console.error("Error fetching category:", categoryError);
            setToast({
              show: true,
              message: t("productPage.failedToLoadProducts"),
              type: "error",
            });
            setProducts([]);
          }
        }
      } catch (error) {
        if (!isMounted) return;

        console.error("Error in main fetchProducts function:", error);
        setToast({
          show: true,
          message: t("productPage.failedToLoadProducts"),
          type: "error",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchAllProducts = async () => {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (!isMounted) return;

      processAndSetProducts(response.data);
    };

    const processAndSetProducts = (data) => {
      const productsWithImages = data.map((product) => {
        if (product.image && product.image.data) {
          return {
            ...product,
            imageUrl: `data:image/jpeg;base64,${product.image.data}`,
          };
        }
        return product;
      });

      setProducts(productsWithImages);

      if (!isCategory && promotionName) {
        filterProductsBySearchTerm(productsWithImages, promotionName);
      } else {
        setFilteredProducts(productsWithImages);
      }

      console.log("Processed products:", productsWithImages.length);
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
  }, [promotionName, isCategory, t]);

  /*------------------------------------SEARCH-------------------------------------*/
  useEffect(() => {
    if (!isCategory && promotionName && products.length > 0) {
      filterProductsBySearchTerm(products, promotionName);
    }
  }, [isCategory, promotionName, products]);

  const filterProductsBySearchTerm = (productsList, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") {
      setFilteredProducts(productsList);
      return;
    }

    const decodedSearchTerm = decodeURIComponent(searchTerm.replace(/-/g, " "));
    const searchWords = decodedSearchTerm
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    if (searchWords.length === 0) {
      setFilteredProducts(productsList);
      return;
    }

    const filtered = productsList.filter((product) => {
      const productText = `${product.name} ${product.description || ""} ${product.categories || ""}`.toLowerCase();

      return searchWords.some((word) => productText.includes(word));
    });

    setFilteredProducts(filtered);
    console.log(`Filtered ${filtered.length} products out of ${productsList.length} by search: "${decodedSearchTerm}"`);
  };

  /*--------------------------------------GET-DISPLAY-NAME-------------------------------------*/
  const getDisplayName = () => {
    if (!promotionName) return t("productPage.allProducts");

    if (isCategory) {
      return promotionName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else {
      const decodedSearchTerm = decodeURIComponent(promotionName.replace(/-/g, " "));
      return `„${decodedSearchTerm}”`;
    }
  };

  /*--------------------------------------favoriteS-CART-------------------------------------*/
  const handleAddTofavorites = async (e, productId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAlert(true);
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const isCurrentlyFavorite = favorites.includes(productId);

      if (isCurrentlyFavorite) {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/favorites/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setFavorites(favorites.filter((id) => id !== productId));
        setToast({
          show: true,
          message: t("productPage.removedFromFavorites"),
          type: "success",
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/favorites`,
          { productId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        setFavorites([...favorites, productId]);
        setToast({
          show: true,
          message: t("productPage.addedToFavorites"),
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      setToast({
        show: true,
        message: t("productPage.favoritesError"),
        type: "error",
      });
    }
  };

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAlert(true);
      return;
    }
  };

  const handleProductClick = (productOrId) => {
    const productId = typeof productOrId === "object" && productOrId !== null ? productOrId.id : productOrId;

    if (productId) {
      navigate(`/singleProductPage/${productId}`);
    } else {
      console.error("Invalid product ID for navigation:", productOrId);
    }
  };

  /*--------------------------------------FILTERING---------------------------------------*/
  const applyFilters = () => {
    let filtered = [...products];

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
    } else if (sortOrder === "highToLow") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  };

  const handlePriceChange = (e, type) => {
    const value = e.target.value;

    if (value === "" || Number(value) >= 0) {
      if (type === "lower") {
        setLowerPrice(value);
      } else {
        setUpperPrice(value);
      }
    }
  };

  const handleSortToggle = (newSortOrder) => {
    setSortOrder(sortOrder === newSortOrder ? null : newSortOrder);
  };

  useEffect(() => {
    applyFilters();
  }, [lowerPrice, upperPrice, sortOrder, products]);

  return (
    <div className="productPage">
      <ConfirmationToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "", type: "" })} />
      <RedirectAlertForFunctions show={showAlert} onClose={() => setShowAlert(false)} />

      {/*------------------------------------------FILTRATION------------------------------------------*/}
      <div className="productFilters">
        <h2 className="filtersTitle">{t("productPage.filtration")}: </h2>
        <hr></hr>
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
        {isLoading ? (
          <div className="loading"></div>
        ) : filteredProducts.length > 0 ? (
          <div className="pPProductGrid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="pPProductCard" onClick={() => handleProductClick(product.id)}>
                <div className="pPImageContainer">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="pPProductImage"
                      loading="lazy"
                      onError={(e) => {
                        console.error("Image failed to load for product:", product.id);
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="pPImagePlaceholder">{t("productPage.noProductImage")}</div>
                  )}
                  <button className="wishlistButton" onClick={(e) => handleAddTofavorites(e, product.id)}>
                    <i className="fa-regular fa-heart"></i>
                  </button>
                </div>
                <div className="pPProductInfo">
                  <h3 className="pPProductTitle">{product.name}</h3>
                  <div className="pPProductFooter">
                    <span className="pPProductPrice">
                      {product.price} {t("productPage.lv")}.
                    </span>
                    <button className="pPAddToCart" onClick={(e) => handleAddToCart(e, product.id)}>
                      <i className="fa-solid fa-cart-shopping"></i>
                      {t("productPage.addToCart")}
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
  );
};

export default ProductPage;
