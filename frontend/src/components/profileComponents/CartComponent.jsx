import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";
import ConfirmationToast from "../reusableComponents/ConfirmationToast.jsx";
import useRemoveAddHandler from "../reusableComponents/RemoveAddItems.jsx";
import LoadingAnimation from "../layout/LoadingAnimation.jsx";
import "./CartComponent.css";

const CartComponent = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { favorites, handleAddToFavorites, isAddingToFavorites, isFetchingFavorites } = useRemoveAddHandler();

  useEffect(() => {
    const fetchCartItems = async () => {
      if (isAuthenticated) {
        try {
          setIsLoading(true);
          const token = localStorage.getItem("authToken");
  
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/cart`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const processedItems = response.data.items.map(item => {
            if (item.image && item.image.data) {
              return {
                ...item,
                imageUrl: `data:image/jpeg;base64,${item.image.data}`
              };
            }
            return item;
          });
          
          setCart({
            ...response.data,
            items: processedItems
          });
        }
        catch (error) {
          console.error("Error fetching cart:", error);
          setToast({
            show: true,
            message: t("profile.cart.gettingItemsError"),
            type: "error"
          });
        } 
        finally {
          setIsLoading(false);
        }
      }
    };
  
    fetchCartItems();
  }, [isAuthenticated, setToast, t]);

  const handleRemoveProduct = async (productId) => {
    if (isAuthenticated) {
      setIsRemoving(productId);
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/cart/remove/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setCart((prev) => {
            const itemToRemove = prev.items.find((item) => item.product_id === productId);
            if (!itemToRemove) return prev;
            
            return {
              items: prev.items.filter((item) => item.product_id !== productId),
              totalItems: prev.totalItems - itemToRemove.quantity,
              totalAmount: prev.totalAmount - itemToRemove.price * itemToRemove.quantity,
            };
          });

          setToast({
            show: true,
            message: t("cart.removeSuccess"),
            type: "success",
          });
        }
      } catch (error) {
        console.error("Error removing product:", error);
        setToast({
          show: true,
          message: t("cart.removeError"),
          type: "error",
        });
      } finally {
        setIsRemoving(null);
      }
    }
  };

  return (
    <>
      {isLoading || isFetchingFavorites ? (
        <LoadingAnimation />
      ) : (
      <div className="cart">
        <ConfirmationToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "", type: "" })}/>
        
        {/*-----------------------CART-TITLE-------------------------*/}
        <div className="cartMainList">
          <div className="cartTitleBox">
            <h2 className="cartMainTitle">{t("profile.cartMainTitle")}:&nbsp;</h2>
            <h2 className="cartMainTitleNumber">
              {cart?.totalItems || 0} {t("cart.products")}
            </h2>
          </div>
          
          {/*-----------------------CART-ITEMS-------------------------*/}
          <div className="cartProductsBox">
            {cart.items.map((item) => (
              <div key={item.product_id} className="cartItem">
                <div className="cartItemImage">
                  {item.imageUrl ? (
                    <div className="cartImageBox" onClick={() => navigate(`/single-product/${item.product_id}`)}>
                      <img src={item.imageUrl} className="cartImage"/>
                    </div>
                  ) : (
                    <div className="noImageBox" onClick={() => navigate(`/single-product/${item.product_id}`)}>
                      <p><i className="fa-solid fa-camera"></i> <span>{t("profile.favorites.noImage")}</span></p>
                    </div>
                  )}
                </div>
                <div className="cartInfo">
                  <h3 className="cartName">{item.name}</h3>
                  <p className="cartPrice">{item.price} {t("profile.lv")}.</p>
                  <div className={`stockInfo ${item.stock > 0 ? "available" : "soldOut"}`}>
                    {item.stock > 0 ? (item.stock === 1 ? (
                      <p><i className="fa-solid fa-check"></i> {t("profile.favorites.only")} {item.stock} {t("profile.favorites.isLeft")}</p>
                    ) : (
                      <p><i className="fa-solid fa-check"></i> {t("profile.favorites.only")} {item.stock} {t("profile.favorites.areLeft")}</p>
                    )) : (
                      <p><i className="fa-solid fa-xmark"></i>{t("profile.favorites.noProductsLeft")}</p>
                    )}
                  </div>
                </div>
                <div className="cartItemButtons">
                  <button className="addToFavorites">
                    
                  </button>
                  <button className="removeFromCart" onClick={() => handleRemoveProduct(item.product_id)}disabled={isRemoving === item.product_id}>
                    {isRemoving === item.product_id ? t("cart.removing") : t("cart.remove")}
                 </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/*-----------------------CART-CHECKOUT-------------------------*/}
        <div className="cartPaying">
          <h2>Cart Summary</h2>
          <div className="cartSummary">
            <div className="summaryRow total">
              <span>Total Amount:</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default CartComponent;