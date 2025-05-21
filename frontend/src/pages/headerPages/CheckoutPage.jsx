import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ConfirmationToast from "../../components/reusableComponents/ConfirmationToast.jsx";
import LoadingAnimation from "../../components/layout/LoadingAnimation.jsx";
import "./CheckoutPage.css";
import { AuthContext } from "../../components/protectionComponents/AuthContext.jsx";
import SpeedyLogo from "../../../public/images/speedyLogo.png";
import FreshBalanceLogo from "../../../public/images/freshBalance.png";
import CustomDropdown from "../../components/reusableComponents/CustomDropdown.jsx";
import ScrollToTop from "../../components/reusableComponents/ScrollToTop.jsx";
import { z } from "zod";
import axios from "axios";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [returnToTop, setReturnToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(null);
  const [cities, setCities] = useState([]);
  const [offices, setOffices] = useState([]);
  const [stores, setStores] = useState([]);
  const token = localStorage.getItem("authToken");
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
    
    paymentMethod: "",
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    notes: "",
  });
  const navigate = useNavigate();

  /*---------------------CHEKING-DATA---------------------*/
   useEffect(() => {
    const fetchLatestCart = async () => {
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to cart.");
        setToast({
          show: true,
          message: t("profile.checkout.cantReachCheckout"),
          type: "error",
        });
        navigate("/profile/cart");
        return;
      }
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/cart`, {
          headers: {
            "Authorization": `Bearer ${token}`
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
        const currentShippingPrice = processedItems.length > 0 ? 4.99 : 0;
        const currentTotalAmountWithShipping = ((Number(calculatedTotalAmount) + currentShippingPrice) || 0).toFixed(2);
        const latestCheckoutData = {
          items: processedItems,
          subtotal: Number(calculatedTotalAmount) || 0,
          shipping: Number(currentShippingPrice),
          total: Number(currentTotalAmountWithShipping),
          timestamp: new Date().getTime()
        };
        if (!latestCheckoutData.items || latestCheckoutData.items.length === 0) {
          console.log("Cart is empty on checkout page load, redirecting to cart!");
          setToast({
            show: true,
            message: t("profile.checkout.cantReachCheckout"),
            type: "error",
          });
          navigate("/profile/cart");
          return;
        }
        setCheckoutData(latestCheckoutData);
        setFormData(prev => ({
          ...prev,
          email: user?.email || prev.email
        }));
      } 
      catch (error) {
        console.error("Error fetching latest cart data for checkout:", error);
        setToast({
          show: true,
          message: t("profile.checkout.loadingError"),
          type: "error",
        });
        navigate("/profile/cart");
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchLatestCart();
    loadStores();
    loadCities();
  }, [navigate, isAuthenticated, token, user?.email, t]);

  useEffect(() => {
    if(formData.selectedCity){
      loadSpeedyOffices(formData.selectedCity);
    }
    else{
      setOffices([]);
    }
  }, [formData.selectedCity, token, t]);

  /*---------------------ZOD-VALIDATION-SCHEMA--------------------*/
  const checkoutSchema = z.object({
    firstName: z.string()
      .trim()
      .min(1, t("profile.validation.firstNameRequired")),
    lastName: z.string()
      .trim()
      .min(1, t("profile.validation.lastNameRequired")),
    phone: z.string()
      .trim()
      .min(1, t("profile.validation.phoneRequired"))
      .regex(/^\+?[0-9\s-()]{6,20}$/, t("profile.validation.phoneInvalid")),
    email: z.string()
      .trim()
      .min(1, t("profile.validation.emailRequired"))
      .email(t("profile.validation.emailInvalid")),
    deliveryMethod: z.enum(["speedyAddress", "speedyOffice", "freshBalance"], {message: t("profile.validation.deliveryMethodRequired"),}),
    address: z.string()
      .trim()
      .min(1, t("profile.validation.addressRequired"))
      .optional(),
    city: z.string()
      .trim()
      .min(1, t("profile.validation.cityRequired"))
      .optional(),
    addressDetails: z.string()
      .trim()
      .min(1, t("profile.validation.addressDetailsRequired"))
      .optional(),
    postalCode: z.string()
      .trim()
      .min(1, t("profile.validation.postalCodeRequired"))
      .optional(),
    selectedCity: z.string()
      .trim()
      .min(1, t("profile.validation.selectedCityRequired"))
      .optional(),
    selectedOffice: z.string()
      .trim()
      .min(1, t("profile.validation.selectedOfficeRequired"))
      .optional(),
    selectedStore: z.string()
      .or(z.number())
      .pipe(z.coerce.string()
      .trim()
      .min(1, t("profile.validation.selectedStoreRequired")))
      .optional(),
    paymentMethod: z.enum(["cash", "card"], {message: t("profile.validation.paymentMethodRequired"),}),
    cardName: z.string()
      .trim()
      .min(1, t("profile.validation.cardNameRequired"))
      .optional(),
    cardNumber: z.string()
      .trim()
      .min(1, t("profile.validation.cardNumberRequired"))
      .regex(/^[0-9]{13,19}$/, t("profile.validation.cardNumberInvalid"))
      .optional(),
    expiryDate: z.string().trim()
      .min(1, t("profile.validation.expiryDateRequired"))
      .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, t("profile.validation.expiryDateInvalid"))
      .optional(),
    cvv: z.string()
      .trim()
      .min(1, t("profile.validation.cvvRequired"))
      .regex(/^[0-9]{3,4}$/, t("profile.validation.cvvInvalid"))
      .optional(),
    notes: z.string()
      .trim()
      .optional(),
  }).superRefine((data, ctx) => {
    if (data.deliveryMethod === "speedyAddress") {
      if (!data.city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("profile.validation.cityRequired"), path: ["city"] });
      if (!data.address) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("profile.validation.addressRequired"), path: ["address"] });
      if (!data.addressDetails) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("profile.validation.addressDetailsRequired"), path: ["addressDetails"] });
      if (!data.postalCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("profile.validation.postalCodeRequired"), path: ["postalCode"] });
    } 
    else if (data.deliveryMethod === "speedyOffice") {
      if (!data.selectedCity) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("profile.validation.selectedCityRequired"), path: ["selectedCity"] });
      if (!data.selectedOffice) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("profile.validation.selectedOfficeRequired"), path: ["selectedOffice"] });
    }
    else if (data.deliveryMethod === "freshBalance") {
      if (!data.selectedStore || String(data.selectedStore).trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("profile.validation.selectedStoreRequired"), path: ["selectedStore"] });
      }
    }

    if (data.paymentMethod === "card") {
      if (!data.cardName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("profile.validation.cardNameRequired"), path: ["cardName"] });
      if (!data.cardNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("profile.validation.cardNumberRequired"), path: ["cardNumber"] });
      if (!data.expiryDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("profile.validation.expiryDateRequired"), path: ["expiryDate"] });
      if (!data.cvv) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("profile.validation.cvvRequired"), path: ["cvv"] });
    }
  })

  /*---------------------REQUIRED-FIELDS--------------------*/
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

  /*-------------------------------------DELIVERY--------------------------------------*/
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

  /*----------------GETTING-CITIES---------------*/
  const loadCities = async() => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders/cities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setCities(response.data);
    }
    catch (error) {
      console.error("Error fetching cities:", error);
      setToast({
        show: true,
        message: t("profile.checkout.loadingError"),
        type: "error"
      });
      setCities([]);
    }
  }

  /*-----------GETTING-SPEEDY-OFFICES------------*/
  const loadSpeedyOffices = async(city) => {
    if (!city) {
      setOffices([]);
      return;
    }
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders/speedy-offices/${city}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log(response.data);
      setOffices(response.data || []);
    }
    catch (error) {
      console.error("Error loading offices:", error);
      setOffices([]);
    }
  };

  /*--------GETTING-FRESHBALANCE-STORES----------*/
  const loadStores = async() => {
    try{
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders/stores`, {
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
      setStores(response.data);
    } 
    catch (error) {
      console.error("Error loading stores:", error);
    }
  };

  /*--------------CUSTOM-DROPDOWN---------------*/
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDropdownSelect = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    if (name === "selectedCity") {
      setFormData(prev => ({
        ...prev,
        selectedCity: value,
        selectedOffice:"",
      }))
      loadSpeedyOffices(value);
    }
  };

  /*----------------------------HANDLE-SUBMIT----------------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setReturnToTop(true);
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
        sessionStorage.removeItem("checkoutData");
        
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

  /*-----------------------LOAIDNG-ANIMATION-------------------------*/
  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="checkoutContainer">
      <ScrollToTop trigger={returnToTop}/>
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
                            <CustomDropdown options={cities} selectedValue={formData.selectedCity} onSelect={handleDropdownSelect} placeholder={t("profile.checkout.selectCity")} name="selectedCity"/>
                          </div>
                          <div className="formGroup">
                            <label htmlFor="selectedOffice">{t("profile.checkout.selectOffice")}: </label>
                            <CustomDropdown options={offices.map((office, index) => ({value: index.toString(), label: `${office.name} - ${office.address}`}))} selectedValue={formData.selectedOffice} onSelect={handleDropdownSelect} placeholder={t("profile.checkout.selectOffice")} name="selectedOffice" disabled={!formData.selectedCity} />
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
                            <CustomDropdown options={stores.map(store => ({value: store.id, label:store.displayText }))} selectedValue={formData.selectedStore} onSelect={handleDropdownSelect} placeholder={t("profile.checkout.selectStore")} name="selectedStore"/>
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
                <div className="paymentOptions">
                  <button type="button" className={`paymentBtn ${formData.paymentMethod === "cash" ? "active" : ""}`} onClick={() => handleInputChange({ target: { name: "paymentMethod", value: "cash" } })} >
                    <i className="fa-solid fa-money-bill-wave"></i>
                    <span className="paymentBtnText">{t("profile.checkout.paymentCash")}</span>
                  </button>
                  <button type="button" className={`paymentBtn ${formData.paymentMethod === "card" ? "active" : ""}`} onClick={() => handleInputChange({ target: { name: "paymentMethod", value: "card" } })} >
                    <i className="fa-solid fa-credit-card"></i>
                    <span className="paymentBtnText">{t("profile.checkout.paymentCreditCard")}</span>
                  </button>
                </div>
              </div>

              {formData.paymentMethod === "cash" && (
                <div className="cashDetails"><i class="fa-solid fa-wallet"></i><span>{t("profile.checkout.paymentCashMessage")}</span></div>
              )}

              {formData.paymentMethod === "card" && (
                <div className="cardDetails">
                  <div className="formGroup">
                    <label htmlFor="cardName">{t("profile.checkout.paymentNameOnCard")}:</label>
                    <input type="text" id="cardName" name="cardName" value={formData.cardName} onChange={handleInputChange} required />
                  </div>
                  
                  <div className="formGroup">
                    <label htmlFor="cardNumber">{t("profile.checkout.paymentCardNumber")}:</label>
                    <input type="text" id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="xxxx xxxx xxxx xxxx" required />
                  </div>
                  
                  <div className="formRow">
                    <div className="formGroup">
                      <label htmlFor="expiryDate">{t("profile.checkout.paymentExpiryDate")}:</label>
                      <input type="text" id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} placeholder="MM/YY" required />
                    </div>
                    <div className="formGroup">
                      <label htmlFor="cvv">{t("profile.checkout.paymentCVV")}:</label>
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
                <label htmlFor="notes">{t("profile.checkout.additionalInformationTextareaTitle")}:</label>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows="3" ></textarea>
              </div>
            </div>
            
            {/*-----------------------------CHECKOUT-BUTTON--------------------------------*/}
            <div className="finishOrderBox">
              <h2>{t("profile.checkout.finishOrderTitle")}</h2>
              <div className="finishOrderBtns">
                <button type="button" className="backToCartBtn" onClick={() => navigate('/profile/cart')}>
                  {t("profile.checkout.backToCart")}
                </button>
                <button type="submit" className={`finishOrderBtn${isSubmitting ? "blocked" : ""}`} disabled={isSubmitting}>
                  {isSubmitting ? t("profile.checkout.confirmOrderLoading") : t("profile.checkout.confirmOrder")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/*--------------------------SUMMARY-SECTION-----------------------------*/}
      <div className="formSection orderSummarySection">
        <h2 className="orderSummaryTitle">{t("profile.checkout.orderSummary")}</h2>
        <div className="orderItems">
          {checkoutData.items.map((item) => (
            <div key={item.product_id} className="orderItem">
              <div className="itemDetails">
                <h3 className="orderSummarySubTitle">{item.name}</h3>
                <p>{t("profile.checkout.quantityTitle")}: {item.quantity}</p>
                <p>{t("profile.checkout.priceTitle")}: {(item.price * item.quantity).toFixed(2)} {t("profile.lv")}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="orderTotals">
          <div className="orderSummaryTotalRow">
            <span>{t("profile.checkout.subtotalTitle")}:</span>
            <span>{checkoutData.subtotal.toFixed(2)} {t("profile.lv")}</span>
          </div>
          <div className="orderSummaryTotalRow">
            <span>{t("profile.checkout.shippingTitle")}:</span>
            <span>{checkoutData.shipping.toFixed(2)} {t("profile.lv")}</span>
          </div>
          <div className="orderSummaryTotalRow total">
            <span>{t("profile.checkout.totalTitle")}:</span>
            <span>{checkoutData.total.toFixed(2)} {t("profile.lv")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;