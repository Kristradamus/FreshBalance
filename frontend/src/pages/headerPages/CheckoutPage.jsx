import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ConfirmationToast from "../../components/reusableComponents/ConfirmationToast.jsx";
import LoadingAnimation from "../../components/layout/LoadingAnimation.jsx";
import "./CheckoutPage.css";
import { AuthContext } from "../../components/protectionComponents/AuthContext.jsx";
import SpeedyLogo from "../../../public/images/speedyLogo.png";
import FreshBalanceLogo from "../../../public/images/freshBalance.png";
import axios from "axios";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(null);
  const [cities, setCities] = useState([]);
  const [offices, setOffices] = useState([]);
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    addressDetails: "",
    postalCode: "",
    country: "",
    phone: "",
    email: user?.email || "",
    deliveryMethod: "",
    selectedCity: "",
    selectedOffice: "",
    selectedStore: "",
    
    paymentMethod: "cash",
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    notes: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }

    const storedCheckoutData = sessionStorage.getItem("checkoutData");
    console.log("Retrieved checkout data:", storedCheckoutData);
    
    if (!storedCheckoutData) {
      console.log("No checkout data found, redirecting to cart");
      navigate("/profile/cart");
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedCheckoutData);
      console.log("Parsed checkout data:", parsedData);
      
      const isDataFresh = (new Date().getTime() - (parsedData.timestamp || 0)) < (30 * 60 * 1000);
      console.log("Data freshness:", isDataFresh);
      
      if (!isDataFresh || 
          !parsedData.items || 
          !Array.isArray(parsedData.items) || 
          parsedData.items.length === 0 ||
          typeof parsedData.subtotal !== "number" ||
          typeof parsedData.shipping !== "number" ||
          typeof parsedData.total !== "number") {
        console.log("Invalid checkout data, redirecting to cart");
        setToast({
          show:true,
          message:t("profile.checkout.cantReachCheckout"),
          type:"error",
        })
        navigate("/profile/cart");
        return;
      }
      
      setCheckoutData(parsedData);
      setIsLoading(false);
    } 
    catch (error) {
      console.error("Error parsing checkout data:", error);
      setToast({
        show:true,
        message:t("profile.checkout.cantReachCheckout"),
        type:"error",
      })
      navigate("/profile/cart");
    }

    setCities(["София", "Пловдив", "Варна", "Burgas", "Stara Zagora"]);
    setStores(["FreshBalance Sofia Mall", "FreshBalance Paradise Center", "FreshBalance The Mall", "FreshBalance Serdika Center"]);
  }, [navigate]);

  useEffect(() => {
    if (formData.selectedCity) {
      const cityOffices = {
        "Sofia": ["Office Sofia 1", "Office Sofia 2", "Office Sofia 3", "Central Sofia Office"],
        "Plovdiv": ["Office Plovdiv 1", "Office Plovdiv 2"],
        "Varna": ["Office Varna 1", "Office Varna 2", "Office Varna 3"],
        "Burgas": ["Office Burgas 1", "Office Burgas 2"],
        "Stara Zagora": ["Office Stara Zagora 1"]
      };
      
      setOffices(cityOffices[formData.selectedCity] || []);
    } 
    else {
      setOffices([]);
    }
  }, [formData.selectedCity]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDeliveryMethodSelect = (method) => {
    setSelectedDeliveryMethod(method);
    setFormData({
      ...formData,
      deliveryMethod: method,
      selectedCity: "",
      selectedOffice: "",
      selectedStore: ""
    });
  };

  const validateForm = () => {
    const requiredFields = ["firstName", "lastName", "phone", "email"];
    
    if (formData.deliveryMethod === "speedyAddress") {
      requiredFields.push("city", "address", "addressDetails", "postalCode");
    } 
    else if (formData.deliveryMethod === "speedyOffice") {
      requiredFields.push("selectedCity", "selectedOffice");
    } 
    else if (formData.deliveryMethod === "freshBalance") {
      requiredFields.push("selectedStore");
    } 
    else {
      setToast({
        show: true,
        message: t("profile.checkout.allFieldsRequiered"),
        type: "error"
      });
      return false;
    }
    
    if (formData.paymentMethod === "card") {
      requiredFields.push("cardName", "cardNumber", "expiryDate", "cvv");
    }

    const emptyFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (emptyFields.length > 0) {
      setToast({
        show: true,
        message: t("profile.checkout.allFieldsRequiered"),
        type: "error"
      });
      return false;
    }
    
    return true;
  };

  const handleCheckout = () => {
    const outOfStockItems = checkoutData.items.filter(item => item.stock <= 0);
    const itemsExceedingStock = checkoutData.items.filter(item => 
      item.quantity > item.stock && item.stock > 0
    );
  
    if (outOfStockItems.length > 0 || itemsExceedingStock.length > 0) {
      setToast({
        show: true,
        message: t("profile.checkout.error", {
          outOfStock: outOfStockItems.length,
          exceedingStock: itemsExceedingStock.length
        }),
        type: "error"
      });
      return;
    }
  
    if (!checkoutData.items || checkoutData.items.length === 0) {
      setToast({
        show: true,
        message: t("profile.checkout.emptyCartError"),
        type: "error"
      });
      return;
    }
  };

  /*----------------------------HANDLE-SUBMIT----------------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
      setToast({
        show: true,
        message: t("profile.checkout.emptyCartError"),
        type: "error"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let deliveryInfo = {
        method: formData.deliveryMethod,
        country: "Bulgaria",
      };
      
      if (formData.deliveryMethod === "speedyAddress") {
        deliveryInfo = {
          ...deliveryInfo,
          address: formData.address,
          addressDetails: formData.addressDetails,
          city: formData.city,
          postalCode: formData.postalCode,
        };
      } else if (formData.deliveryMethod === "speedyOffice") {
        deliveryInfo = {
          ...deliveryInfo,
          city: formData.selectedCity,
          office: formData.selectedOffice,
        };
      } else if (formData.deliveryMethod === "freshBalance") {
        deliveryInfo = {
          ...deliveryInfo,
          store: formData.selectedStore,
        };
      }
      
      const orderData = {
        user_id: user?.id || null,
        customer_info: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        delivery_info: deliveryInfo,
        payment_info: {
          method: formData.paymentMethod,
          status: formData.paymentMethod === "cash" ? "pending" : "processing"
        },
        items: checkoutData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: checkoutData.subtotal,
        shipping_cost: checkoutData.shipping,
        total_amount: checkoutData.total,
        notes: formData.notes,
        status: "pending",
        created_at: new Date().toISOString()
      };
      
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/orders`, orderData);
      
      if (response.data && response.data.success) {
        sessionStorage.removeItem('checkoutData');
        
        setToast({
          show: true,
          message: t("profile.checkout.orderSuccessful"),
          type: "success"
        });
      
        setTimeout(() => {
          navigate(`/profile/orders`);
        }, 2000);
      } 
      else {
        throw new Error(response.data?.message || "Unknown error occurred");
      }
    } 
    catch (error) {
      console.error("Error creating order:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${import.meta.env.VITE_BACKEND_URL}/orders`
      });
      setToast({
        show: true,
        message: t("profile.checkout.orderError"),
        type: "error"
      });
    }
    finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="checkoutContainer">
      <ConfirmationToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show:false, message: "", type: "" })}/>
      
      <div className="checkoutHeader">
        <h1>{t("profile.checkout.mainTitle")}</h1>
      </div>
      
      <div className="checkoutContent">
        <div className="checkoutFormContainer">
          <form className="checkoutForm" onSubmit={handleSubmit}>

            {/*---------------------------INFORMATION-SECTION---------------------------*/}
            <div className="formSection shippingSection">
              <h2>{t("profile.checkout.userInformation")}</h2>
              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="checkoutFirstName">{t("profile.checkout.firstName")}: </label>
                  <input type="text" id="checkoutFirstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="formGroup">
                  <label htmlFor="checkoutLastName">{t("profile.checkout.lastName")}: </label>
                  <input type="text" id="checkoutLastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="checkoutPhone">{t("profile.checkout.phoneNumber")}: </label>
                  <input type="tel" id="checkoutPhone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="formGroup">
                  <label htmlFor="checkoutEmail">{t("profile.checkout.email")}: </label>
                  <input type="email" id="checkoutEmail" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
              </div>
            </div>

            {/*---------------------------------DELIVERY-OPTIONS-----------------------------*/}
            <div className="formSection deliveryWay">
              <h2>{t("profile.checkout.deliveryWay")}</h2>
              <div className="formGroup deliveryMethods">
                <label>{t("profile.checkout.deliveryWayOptions")}:</label>
                <div className="deliveryOptions">
                  <button type="button"className={`deliveryBtn Speedy ${selectedDeliveryMethod === "speedyAddress" ? "active" : ""}`} onClick={() => handleDeliveryMethodSelect("speedyAddress")}>
                    <span className="deliveryBtnText"><img src={SpeedyLogo} className="speedyLogo"/> - {t("profile.checkout.toAddress")}</span>
                  </button>
                  <button type="button"className={`deliveryBtn Speedy ${selectedDeliveryMethod === "speedyOffice" ? "active" : ""}`} onClick={() => handleDeliveryMethodSelect("speedyOffice")}>
                    <span className="deliveryBtnText"><img src={SpeedyLogo} className="speedyLogo"/> - {t("profile.checkout.toOffice")}</span>
                  </button>
                  <button type="button"className={`deliveryBtn FreshBalance ${selectedDeliveryMethod === "freshBalance" ? "active" : ""}`} onClick={() => handleDeliveryMethodSelect("freshBalance")}>
                    <span className="deliveryBtnText"><img src={FreshBalanceLogo} className="freshBalanceLogo"/>&nbsp;&nbsp; - {t("profile.checkout.toStore")}</span>
                  </button>
                </div>

                {selectedDeliveryMethod && (
                  <div className="deliveryDetails">
                    {selectedDeliveryMethod === "speedyAddress" && (
                      <div className="addressDelivery">
                        <h3>{t("profile.checkout.deliveryToAddress")}</h3>
                        <div className="addressForm">
                          <div className="formRow">
                            <div className="formGroup">
                              <label htmlFor="city">{t("profile.checkout.city")}: </label>
                              <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                            </div>
                            <div className="formGroup">
                              <label htmlFor="postalCode">{t("profile.checkout.postalCode")}: </label>
                              <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required />
                            </div>
                          </div>
                          <div className="formGroup">
                            <label htmlFor="address">{t("profile.checkout.addressPart1")}: </label>
                            <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                          </div>
                          <div className="formGroup">
                            <label htmlFor="addressDetails">{t("profile.checkout.addressPart2")}: </label>
                            <input type="text" id="addressDetails" name="addressDetails" value={formData.addressDetails} onChange={handleInputChange} required />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDeliveryMethod === "speedyOffice" && (
                      <div className="officeDelivery">
                        <h3>{t("profile.checkout.deliveryToOffice")}</h3>
                        <div className="officeForm">
                          <div className="formGroup">
                            <label htmlFor="selectedCity">{t("profile.checkout.selectCity")}: </label>
                            <select id="selectedCity" name="selectedCity" value={formData.selectedCity} onChange={handleInputChange} required >
                              <option value="">{t("profile.checkout.selectCity")}</option>
                              {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                          </div>
                          <div className="formGroup">
                            <label htmlFor="selectedOffice">{t("profile.checkout.selectOffice")}: </label>
                            <select id="selectedOffice" name="selectedOffice" value={formData.selectedOffice} onChange={handleInputChange} required disabled={!formData.selectedCity} >
                              <option value="">{t("profile.checkout.selectOffice")}</option>
                              {offices.map(office => (
                                <option key={office} value={office}>{office}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDeliveryMethod === "freshBalance" && (
                      <div className="storeDelivery">
                        <h3>{t("profile.checkout.deliveryToStore")}</h3>
                        <div className="storeForm">
                          <div className="formGroup">
                            <label htmlFor="selectedStore">{t("profile.checkout.selectStore")}: </label>
                            <select id="selectedStore" name="selectedStore" value={formData.selectedStore} onChange={handleInputChange} required >
                              <option value="">{t("profile.checkout.selectStore")}</option>
                              {stores.map(store => (
                                <option key={store} value={store}>{store}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/*---------------------------------PAYMENT-SECTION-----------------------------*/}
            <div className="formSection paymentSection">
              <h2>{t("profile.checkout.paymentInformation")}</h2>
              <div className="formGroup paymentMethods">
                <label>{t("checkout.paymentMethod")} *</label>
                <div className="payment-options">
                  <label className="paymentOption">
                    <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === "cash"} onChange={handleInputChange} />
                    <span>{t("checkout.cash")}</span>
                  </label>
                  <label className="paymentOption">
                    <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === "card"} onChange={handleInputChange} />
                    <span>{t("checkout.creditCard")}</span>
                  </label>
                </div>
              </div>

              {formData.paymentMethod === "cash" && (
                <div className="cashDetails"></div>
              )}
              {formData.paymentMethod === "card" && (
                <div className="cardDetails">
                  <div className="formGroup">
                    <label htmlFor="cardName">{t("checkout.nameOnCard")} *</label>
                    <input type="text" id="cardName" name="cardName" value={formData.cardName} onChange={handleInputChange} required />
                  </div>
                  
                  <div className="formGroup">
                    <label htmlFor="cardNumber">{t("checkout.cardNumber")} *</label>
                    <input type="text" id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="xxxx xxxx xxxx xxxx" required />
                  </div>
                  
                  <div className="formRow">
                    <div className="formGroup">
                      <label htmlFor="expiryDate">{t("checkout.expiryDate")} *</label>
                      <input type="text" id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} placeholder="MM/YY" required />
                    </div>
                    <div className="formGroup">
                      <label htmlFor="cvv">CVV *</label>
                      <input type="text" id="cvv" name="cvv" value={formData.cvv} onChange={handleInputChange} placeholder="xxx" required />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/*----------------------------ADDITIONAL-INFORMATION--------------------------------*/}
            <div className="formSection additionalSection">
              <h2>{t("profile.checkout.additionalInformation")}</h2>
              <div className="formGroup">
                <label htmlFor="notes">{t("checkout.orderNotes")}</label>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder={t("checkout.notesPlaceholder")} rows="3" ></textarea>
              </div>
            </div>
            
            {/*-----------------------------CHECKOUT-BUTTON--------------------------------*/}
            <div className="checkoutButtons">
              <button type="button" className="backToCartBtn" onClick={() => navigate('/profile/cart')}>
                {t("checkout.backToCart")}
              </button>
              <button type="submit" className="finishOrderBtn" disabled={isSubmitting}>
                {isSubmitting ? t("checkout.processing") : t("checkout.placeOrder")}
              </button>
            </div>
          </form>
        </div>
      </div>


      <div className="formSection orderSummarySection">
        <h2>{t("checkout.orderSummary")}</h2>
        <div className="orderItems">
          {checkoutData.items.map((item) => (
            <div key={item.product_id} className="orderItem">
              <div className="itemDetails">
                <h3>{item.name}</h3>
                <p>{t("checkout.quantity")}: {item.quantity}</p>
                <p>{t("checkout.price")}: {(item.price * item.quantity).toFixed(2)} {t("profile.lv")}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="orderTotals">
          <div className="totalRow">
            <span>{t("checkout.subtotal")}:</span>
            <span>{checkoutData.subtotal.toFixed(2)} {t("profile.lv")}</span>
          </div>
          <div className="totalRow">
            <span>{t("checkout.shipping")}:</span>
            <span>{checkoutData.shipping.toFixed(2)} {t("profile.lv")}</span>
          </div>
          <div className="totalRow total">
            <span>{t("checkout.total")}:</span>
            <span>{checkoutData.total.toFixed(2)} {t("profile.lv")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;