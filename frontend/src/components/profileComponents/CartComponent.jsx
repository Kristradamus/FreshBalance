import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";
import ConfirmationToast from "../reusableComponents/ConfirmationToast.jsx";
import LoadingAnimation from "../layout/LoadingAnimation.jsx";
import "./CartComponent.css";

const CartComponent = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);

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
          setCart(response.data);
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
  }, [isAuthenticated, toast, t]);

  return (
    <>
      {isLoading ? (
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
            {isLoading ? (
              <div className="loading">Loading...</div>
            ) : !cart?.items || cart.items.length === 0 ? (
              <div className="emptyCart">Your cart is empty</div>
            ) : (
              cart.items.map(item => (
                <div key={item.product_id} className="cartItem">
                  <div className="cartItemImage">
                    {item.image ? (
                      <img src={`data:image/jpeg;base64,${item.image.data}`} alt={item.name} />
                    ) : (
                      <div className="noImage">No Image</div>
                    )}
                  </div>
                  
                  <div className="cartItemDetails">
                    <h3>{item.name}</h3>
                    <p className="itemPrice">
                    </p>
                    <p className="itemQuantity">
                      Quantity: {item.quantity}
                    </p>
                    <p className="subtotal">
                    </p>
                  </div>
                </div>
              ))
            )}
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