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
  const [itemQuantities, setItemQuantities] = useState({});
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { favorites, handleAddToFavorites, isAddingToFavorites, isFetchingFavorites } = useRemoveAddHandler();
  const shippingPrice = cart?.items?.length > 0 ? 4.99 : 0;
  const totalAmountWithShipping = cart?.items?.length > 0 ? ((Number(cart?.totalAmount) + shippingPrice) || 0).toFixed(2) : 0;

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
          let calculatedTotalAmount = 0;
          response.data.items.forEach(item => {
            calculatedTotalAmount += item.price * item.quantity;
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
          
          const quantities = {};
          processedItems.forEach(item => {
            quantities[item.product_id] = item.quantity;
          });
          setItemQuantities(quantities);
          
          setCart({
            ...response.data,
            items: processedItems,
            totalAmount: calculatedTotalAmount || Number(response.data.totalAmount) || 0
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
            const newTotalAmount = prev.totalAmount - (itemToRemove.price * itemToRemove.quantity);
            return {
              ...prev,
              items: prev.items.filter((item) => item.product_id !== productId),
              totalItems: prev.totalItems - itemToRemove.quantity,
              totalAmount: newTotalAmount
            };
          });

          setItemQuantities(prev => {
            const newQuantities = {...prev};
            delete newQuantities[productId];
            return newQuantities;
          });

          setToast({
            show: true,
            message: t("profile.cart.removeSuccess"),
            type: "success",
          });
        }
      } 
      catch (error) {
        console.error("Error removing product:", error);
        setToast({
          show: true,
          message: t("profile.cart.removeError"),
          type: "error",
        });
      } 
      finally {
        setIsRemoving(null);
      }
    }
  };

  /*------------------------QUANTITY----------------------*/
  const handleQuantityChange = (e, productId, stock) => {
    const value = e.target.value;
    
    if (value === "") {
      setItemQuantities({...itemQuantities, [productId]: ""});
      updateCartDisplay(productId, 1);
    } 
    else {
      const parsed = parseInt(value);
      if (!isNaN(parsed) && parsed > 0) {
        const limitedValue = Math.min(parsed, stock);
        setItemQuantities({...itemQuantities, [productId]: limitedValue});
        updateCartItemQuantity(productId, limitedValue);
      }
    }
  };

  const updateCartDisplay = (productId, quantity) => {
    setCart(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.product_id === productId) {
          return {
            ...item,
            quantity: quantity
          };
        }
        return item;
      });
  
      let newTotalItems = 0;
      let newTotalAmount = 0;
      
      updatedItems.forEach(item => {
        newTotalItems += item.quantity;
        newTotalAmount += item.price * item.quantity;
      });
  
      return {
        ...prev,
        items: updatedItems,
        totalItems: newTotalItems,
        totalAmount: newTotalAmount
      };
    });
  };
  
  const handleBlur = (productId) => {
    if (itemQuantities[productId] === "") {
      setItemQuantities(prev => ({...prev, [productId]: 1}));
      updateCartItemQuantity(productId, 1);
    }
  };



  const incrementQuantity = (productId, stock) => {
    setItemQuantities(prev => {
      const currentQty = prev[productId] === "" ? 0 : (parseInt(prev[productId]) || 0);
      const newQty = currentQty < stock ? currentQty + 1 : stock;
      updateCartItemQuantity(productId, newQty);
      return {...prev, [productId]: newQty};
    });
  };
  
  const decrementQuantity = (productId) => {
    setItemQuantities(prev => {
      if (prev[productId] === "" || parseInt(prev[productId]) <= 1) {
        return {...prev, [productId]: 1};
      }

      const currentQty = parseInt(prev[productId]) || 1;
      const newQty = currentQty - 1;
      updateCartItemQuantity(productId, newQty);
      return {...prev, [productId]: newQty};
    });
  };

  const getDisplayQuantity = (productId, defaultQty) => {
    const qty = itemQuantities[productId];
    return qty === "" ? "" : (qty || defaultQty);
  };

  const updateCartItemQuantity = async () => {
  }

  const handleCheckout = () => {
    // Stock validation remains the same
    const outOfStockItems = cart.items.filter(item => item.stock <= 0);
    const itemsExceedingStock = cart.items.filter(item => 
      item.quantity > item.stock && item.stock > 0
    );
  
    if (outOfStockItems.length > 0 || itemsExceedingStock.length > 0) {
      setToast({
        show: true,
        message: t("profile.cart.checkoutError", {
          outOfStock: outOfStockItems.length,
          exceedingStock: itemsExceedingStock.length
        }),
        type: "error"
      });
      return;
    }
  
    try {
      // Ensure we have cart data
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }
  
      // Create checkout data
      const checkoutData = {
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: parseFloat(item.price),
          name: item.name,
          imageUrl: item.imageUrl,
          stock: item.stock
        })),
        subtotal: parseFloat(cart.totalAmount) || 0,
        shipping: 4.99,
        total: (parseFloat(cart.totalAmount) || 0) + 4.99,
        timestamp: new Date().getTime()
      };
  
      // Verify the data is serializable before storing
      const testJson = JSON.stringify(checkoutData);
      if (!testJson) {
        throw new Error("Failed to serialize checkout data");
      }
      
      // Store in sessionStorage with error handling
      try {
        sessionStorage.removeItem('checkoutData');
        sessionStorage.setItem('checkoutData', testJson);
        
        // Verify data was stored correctly
        const verifyData = sessionStorage.getItem('checkoutData');
        if (!verifyData) {
          throw new Error("Failed to verify stored data");
        }
        
        console.log("Successfully stored checkout data:", JSON.parse(verifyData));
        
        // Navigate to checkout
        navigate('/checkout');
      } catch (storageError) {
        console.error("Storage error:", storageError);
        throw new Error("Failed to store checkout data in session");
      }
    } catch (error) {
      console.error("Checkout preparation error:", error);
      setToast({
        show: true,
        message: "Error preparing checkout: " + error.message,
        type: "error"
      });
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
            <h2 className="cartMainTitle">{t("profile.cart.mainTitle")}:&nbsp;</h2>
            <h2 className="cartMainTitleNumber">
              {cart?.totalItems === 1 ? (
                <span>{cart?.totalItems} {t("profile.product")}</span>
              ) : (
                <span>{cart?.totalItems || 0} {t("profile.products")}</span>
              )}
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
                  <p className="cartPrice">{((item.price * (itemQuantities[item.product_id] || item.quantity))).toFixed(2)} {t("profile.lv")}</p>
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
                  <button className="profileWishlistButton" onClick={(e) => handleAddToFavorites(e, item.product_id, setToast, t)} disabled={isAddingToFavorites === item.product_id}>
                    <i className={`fa-heart ${favorites.includes(item.product_id) ? "fa-solid active" : "fa-regular"}`}></i>
                  </button>
                  <div className="cartItemButtonsBottom">
                    <div className="cartQuantityControl">
                      <button className="cartQuantityBtn" onClick={() => decrementQuantity(item.product_id)} disabled={isRemoving === item.product_id || (itemQuantities[item.product_id] === "" || (parseInt(itemQuantities[item.product_id]) <= 1 && itemQuantities[item.product_id] !== ""))}>
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <input type="text" value={getDisplayQuantity(item.product_id, item.quantity)} onChange={(e) => handleQuantityChange(e, item.product_id, item.stock)} onBlur={() => handleBlur(item.product_id)}className="cartQuantityInput" disabled={isRemoving === item.product_id}/>
                      <button className="cartQuantityBtn" onClick={() => incrementQuantity(item.product_id, item.stock)} disabled={isRemoving === item.product_id || (parseInt(itemQuantities[item.product_id] || 0) >= item.stock)}>
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                    <button className="removeFromCart" onClick={() => handleRemoveProduct(item.product_id)} disabled={isRemoving === item.product_id}>
                      <i className="fa-solid fa-trash"></i>
                      {isRemoving === item.product_id ? (
                        <span>{t("profile.favorites.removing") + "..."}</span>
                      ) : (
                        <span>{t("profile.favorites.remove")}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/*-----------------------CART-CHECKOUT-------------------------*/}
        <div className="cartPaying">
          <h2>{t("profile.cart.cartSummary")}: </h2>
          <div className="cartSummary">
            <div className="cartSummaryElementBox">
              <p>{t("profile.cart.productsPrice")}:</p>
              <p>{(Number(cart?.totalAmount) || 0).toFixed(2)} {t("profile.lv")}</p>
            </div>
            <div className="cartSummaryElementBox">
              <p>{t("profile.cart.shippingPrice")}:</p>
              <p>{shippingPrice} {t("profile.lv")}</p>
            </div>
            <hr/>
            <div className="cartSummaryElementBox">
              <h3>{t("profile.cart.totalAmount")}:</h3>
              <h3>{totalAmountWithShipping} {t("profile.lv")}</h3>
            </div>
            <button className="checkoutBtn" onClick={handleCheckout} disabled={!cart?.items.length > 0}>
              <span>{t("profile.cart.checkout")}</span>
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default CartComponent;