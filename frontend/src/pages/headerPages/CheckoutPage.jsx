// CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import axios from "axios";
import ConfirmationToast from "../../components/reusableComponents/ConfirmationToast.jsx";
import LoadingAnimation from "../../components/layout/LoadingAnimation.jsx";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    email: "",
    
    // Payment details
    paymentMethod: "card",
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    
    // Additional info
    notes: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve checkout data
    const storedCheckoutData = sessionStorage.getItem('checkoutData');
    console.log("Retrieved checkout data:", storedCheckoutData);
    
    if (!storedCheckoutData) {
      console.log("No checkout data found, redirecting to cart");
      navigate('/profile/cart');
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedCheckoutData);
      console.log("Parsed checkout data:", parsedData);
      
      // Check if data is fresh (within last 30 minutes)
      const isDataFresh = (new Date().getTime() - (parsedData.timestamp || 0)) < (30 * 60 * 1000);
      console.log("Data freshness:", isDataFresh);
      
      // More comprehensive validation
      if (!isDataFresh || 
          !parsedData.items || 
          !Array.isArray(parsedData.items) || 
          parsedData.items.length === 0 ||
          typeof parsedData.subtotal !== 'number' ||
          typeof parsedData.shipping !== 'number' ||
          typeof parsedData.total !== 'number') {
        console.log("Invalid checkout data, redirecting to cart");
        navigate('/cart');
        return;
      }
      
      setCheckoutData(parsedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error parsing checkout data:", error);
      navigate('/cart');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'address', 'city', 
      'postalCode', 'country', 'phone', 'email'
    ];
    
    // Add payment fields conditionally based on payment method
    if (formData.paymentMethod === 'card') {
      requiredFields.push('cardName', 'cardNumber', 'expiryDate', 'cvv');
    }
    
    // Check for empty required fields
    const emptyFields = requiredFields.filter(field => !formData[field].trim());
    
    if (emptyFields.length > 0) {
      setToast({
        show: true,
        message: t("checkout.requiredFieldsError"),
        type: "error"
      });
      return false;
    }
    
    // Simple email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setToast({
        show: true,
        message: t("checkout.invalidEmailError"),
        type: "error"
      });
      return false;
    }
    
    return true;
  };

  const handleCheckout = () => {
    // Stock validation
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
  
    // Ensure the cart is not empty
    if (!cart.items || cart.items.length === 0) {
      setToast({
        show: true,
        message: t("profile.cart.emptyCartError"),
        type: "error"
      });
      return;
    }
  
    try {
      // Create checkout data with all required fields
      const checkoutData = {
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          imageUrl: item.imageUrl,
          stock: item.stock // Include stock for further validation
        })),
        subtotal: Number(cart.totalAmount) || 0,
        shipping: 4.99,
        total: (Number(cart.totalAmount) || 0) + 4.99,
        timestamp: new Date().getTime() // Add timestamp for freshness check
      };
  
      // Clear any previous checkout data
      sessionStorage.removeItem('checkoutData');
      
      // Store new checkout data
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      console.log("Navigating to checkout with data:", checkoutData);
      
      // Navigate to checkout page
      navigate('/checkout');
    } catch (error) {
      console.error("Error preparing checkout:", error);
      setToast({
        show: true,
        message: "Error preparing checkout data",
        type: "error"
      });
    }
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="checkout-container">
      <ConfirmationToast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />
      
      <div className="checkout-header">
        <h1>{t("checkout.title")}</h1>
        <p>{t("checkout.subtitle")}</p>
      </div>
      
      <div className="checkout-content">
        <div className="checkout-form-container">
          <form className="checkout-form">
            {/* Order Summary Section */}
            <div className="form-section order-summary-section">
              <h2>{t("checkout.orderSummary")}</h2>
              <div className="order-items">
                {checkoutData.items.map((item) => (
                  <div key={item.product_id} className="order-item">
                    <div className="item-image">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p>{t("checkout.quantity")}: {item.quantity}</p>
                      <p>{t("checkout.price")}: {(item.price * item.quantity).toFixed(2)} {t("profile.lv")}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-totals">
                <div className="total-row">
                  <span>{t("checkout.subtotal")}:</span>
                  <span>{checkoutData.subtotal.toFixed(2)} {t("profile.lv")}</span>
                </div>
                <div className="total-row">
                  <span>{t("checkout.shipping")}:</span>
                  <span>{checkoutData.shipping.toFixed(2)} {t("profile.lv")}</span>
                </div>
                <div className="total-row total">
                  <span>{t("checkout.total")}:</span>
                  <span>{checkoutData.total.toFixed(2)} {t("profile.lv")}</span>
                </div>
              </div>
            </div>
            
            {/* Shipping Information Section */}
            <div className="form-section shipping-section">
              <h2>{t("checkout.shippingInformation")}</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">{t("checkout.firstName")} *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">{t("checkout.lastName")} *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="address">{t("checkout.address")} *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">{t("checkout.city")} *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">{t("checkout.postalCode")} *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="country">{t("checkout.country")} *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">{t("checkout.phone")} *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t("checkout.email")} *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Information Section */}
            <div className="form-section payment-section">
              <h2>{t("checkout.paymentInformation")}</h2>
              <div className="form-group payment-methods">
                <label>{t("checkout.paymentMethod")} *</label>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === "card"}
                      onChange={handleInputChange}
                    />
                    <span>{t("checkout.creditCard")}</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === "paypal"}
                      onChange={handleInputChange}
                    />
                    <span>PayPal</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === "bank"}
                      onChange={handleInputChange}
                    />
                    <span>{t("checkout.bankTransfer")}</span>
                  </label>
                </div>
              </div>
              
              {formData.paymentMethod === "card" && (
                <div className="card-details">
                  <div className="form-group">
                    <label htmlFor="cardName">{t("checkout.nameOnCard")} *</label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cardNumber">{t("checkout.cardNumber")} *</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="xxxx xxxx xxxx xxxx"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expiryDate">{t("checkout.expiryDate")} *</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cvv">CVV *</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="xxx"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {formData.paymentMethod === "paypal" && (
                <div className="paypal-info">
                  <p>{t("checkout.redirectToPaypal")}</p>
                </div>
              )}
              
              {formData.paymentMethod === "bank" && (
                <div className="bank-info">
                  <p>{t("checkout.bankTransferInstructions")}</p>
                  <div className="bank-details">
                    <p><strong>{t("checkout.bankName")}:</strong> Example Bank</p>
                    <p><strong>IBAN:</strong> XX00 0000 0000 0000</p>
                    <p><strong>{t("checkout.accountName")}:</strong> Your Store Name</p>
                    <p><strong>{t("checkout.reference")}:</strong> {`ORD-${Date.now().toString().substring(6)}`}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Additional Information Section */}
            <div className="form-section additional-section">
              <h2>{t("checkout.additionalInformation")}</h2>
              <div className="form-group">
                <label htmlFor="notes">{t("checkout.orderNotes")}</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={t("checkout.notesPlaceholder")}
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            {/* Checkout Buttons */}
            <div className="checkout-buttons">
              <button 
                type="button" 
                className="back-to-cart-btn"
                onClick={() => navigate('/cart')}
              >
                {t("checkout.backToCart")}
              </button>
              <button 
                type="submit" 
                className="place-order-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("checkout.processing") : t("checkout.placeOrder")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;