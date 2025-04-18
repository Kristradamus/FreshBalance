import { useState, useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RedirectAlertForFunctions from "../../components/protectionComponents/RedirectAlertForFunctions.jsx";
import ConfirmationToast from "../../components/reusableComponents/ConfirmationToast";
import useRemoveAddHandler from "../../components/reusableComponents/RemoveAddItems.jsx";
import LoadingAnimation from "../../components/layout/LoadingAnimation.jsx";
import axios from "axios";
import "./singleProductPage.css";

const SingleProductPage = () => {
  const { promotionName: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const { favorites, handleAddToFavorites, handleAddToCart, isAddingToCart } = useRemoveAddHandler();
  const [activeTab, setActiveTab] = useState("description");
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/${productId}`);

        if (response.status >= 200 && response.status < 300) {
          const productData = response.data;

          if (productData.image && productData.image.data) {
            productData.imageUrl = `data:image/jpeg;base64,${productData.image.data}`;
          }

          setProduct(productData);
        }
      } 
      catch (error) {
        console.error("Error fetching product details:", error);
        setToast({
          show: true,
          message: t("singleProductPage.failedToLoadProduct"),
          type: "error",
        });
      }
      finally{
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  /*---------------------------------------------QUANTITY-BEHAIVIOR--------------------------------------------*/
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  if (!product) {
    return (
      <div className="productNotFound">
        <button className="goBackButton" onClick={goBack}>
          <i className="fa-solid fa-arrow-left"></i> {t("singleProductPage.backToProducts")}
        </button>
        <h2 className="productNotFoundTitle">{t("singleProductPage.productNotFound")}</h2>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <LoadingAnimation/>
      ) : (
        <div className="singleProductPage">
          <ConfirmationToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "", type: "" })} />
          <RedirectAlertForFunctions show={showAlert} onClose={() => setShowAlert(false)} />
          <div className="productContainer">
  
            {/*------------------------------PRODUCT-IMAGE-------------------------*/}
            <div className="productImageSection">
              {product.imageUrl ? (
                <div className="imageWrapper">
                  <img src={product.imageUrl} alt={product.name} className="productImage" onError={(e) => e.target.style.display = "none"}/>
                  <button className="goBackButtonForProduct" onClick={goBack}>
                    <i className="fa-solid fa-arrow-left"></i> {t("singleProductPage.backToProducts")}
                  </button>
                  <button className="wishlistBtn" onClick={(e) => {handleAddToFavorites(e, product.id, setToast, t, setShowAlert); setIsFavorite(!isFavorite);}}>
                    <i className={`fa-heart ${favorites.includes(product.id) ? "fa-solid active" : "fa-regular"}`}></i>
                  </button>
                </div>
              ) : (
                <div className="imageWrapper">
                  <p>
                    <i className="fa-solid fa-camera"></i> {t("singleProductPage.noProductImage")}
                  </p>
                  <button className="goBackButtonForProduct" onClick={goBack}>
                    <i className="fa-solid fa-arrow-left"></i> {t("singleProductPage.backToProducts")}
                  </button>
                  <button className="wishlistBtn" onClick={(e) => {handleAddToFavorites(e, product.id, setToast, t, setShowAlert);   setIsFavorite(!isFavorite); }} >
                    <i className={`fa-heart ${favorites.includes(product.id) ? "fa-solid active" : "fa-regular"}`}></i>
                  </button>
                </div>
              )}
            </div>
    
            {/*------------------------------PRODUCT-DETAILS------------------------*/}
            <div className="productDetailsSection">
              <h1 className="productMainTitle">{product.name}</h1>
              <div className="productInfoNotTitle">
                {product?.categories?.length > 0 && (
                  <div className="productCategories">
                    {product.categories.map((category, index) => (
                      <p key={index} className="categoryTag" onClick={() => navigate(`${category.link}`)}>
                        {category.name}
                      </p>
                    ))}
                  </div>
                )}
    
                <div className="productPriceBox">
                  <div className="productPrice">
                    <p className="priceValue">{product.price}</p>
                    <p className="priceCurrency">{t("singleProductPage.lv")}.</p>
                  </div>
                  <div className={`stockInfo ${product.stock > 0 ? "available" : "soldOut"}`}>
                    {product.stock > 0 ? (
                      <p><i className="fa-solid fa-check"></i> {t("singleProductPage.inStock")}: {product.stock} {product.stock === 1 ? (t("singleProductPage.piece")) : (t("singleProductPage.pieces"))}</p>
                    ) : (
                      <p><i className="fa-solid fa-xmark"></i>{t("singleProductPage.soldOut")}</p>
                    )}
                  </div>
                </div>
    
                {/*------------------------------PURCASE------------------------*/}
                <div className="purchaseControls">
                  <div className="quantityControl">
                    <button className="quantityBtn" onClick={decrementQuantity}>
                      <i className="fa-solid fa-minus"></i>
                    </button>
                    <input type="number" min="1" value={quantity} onChange={handleQuantityChange} className="quantityInput" />
                    <button className="quantityBtn" onClick={incrementQuantity}>
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
    
                  <button className="singleProductAddToCartBtn" onClick={(e) => handleAddToCart(e, product.id, setToast, t, setShowAlert, quantity)} disabled={isAddingToCart === product.id}>
                    {isAddingToCart === product.id ? (
                      <span><i className="fa-solid fa-cart-shopping"></i> {t("productPage.addingToCart")}</span>
                    ) : (
                      <span><i className="fa-solid fa-cart-shopping"></i> {t("singleProductPage.addToCart")}</span>
                    )}
                  </button>
                </div>
                <hr/>
                <div className="productInformation">
                  <div className="tabs">
                    <button className={`tab ${activeTab === "description" ? "active" : ""}`} onClick={() => setActiveTab("description")}>
                      {t("singleProductPage.description")}
                    </button>
                    <button className={`tab ${activeTab === "details" ? "active" : ""}`} onClick={() => setActiveTab("details")}>
                      {t("singleProductPage.details")}
                    </button>
                  </div>
    
                  <div className="tabContent">
                    {activeTab === "description" && <div className="description-content">{product.description ? <p>{product.description}</p> : <p className="no-content">{t("singleProductPage.noDescription")}</p>}</div>}
                    {activeTab === "details" && <div className="details-content">{product.details ? <p>{product.details}</p> : <p className="no-content">{t("singleProductPage.noDetails")}</p>}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );  
};  
  
export default SingleProductPage;
