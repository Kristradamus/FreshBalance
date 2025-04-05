import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import validator from "validator";

export default function EmailCheck({email, setEmail, displayEmail, setDisplayEmail, setEmailCheckComplete, setEmailExists, userProgress, setUserProgress, resetFormData, setUsername,}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const emailInputRef = useRef(null);
  const [emailError, setEmailError] = useState(false);

  /*-----------------------------------------SMALL-JS--------------------------------------------------*/
  /*IF USER GOES BACK AND CHANGES HIS EMAIL TO RESET ALL VARIABLES*/
  const handleEmailChange = (e) => {
    const rawInput = e.target.value;
    const newEmail = rawInput.trim().toLowerCase();
    setDisplayEmail(rawInput);
    setEmail(newEmail);

    if (userProgress.emailChecked && email !== newEmail) {
      setUserProgress({
        emailChecked: false,
        emailVerified: false,
        termsViewed: false,
      });
      setEmailCheckComplete(false);
      setEmailExists(false);
      resetFormData();
    }
    setEmailError(false);
  };

  /*INPUT-CUSTOMIZATIONS*/
  const handleEmailDivClick = () => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  };

  const handleEmailKeyChange = (e) => {
    if (e.key === "Escape") {
      e.target.blur();
    }
    if (e.key === "Enter") {
      handleEmailCheckContinue();
    }
  };

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  /*-----------------------------------------EMAIL-SUBMIT--------------------------------------------------*/
  const handleEmailCheckContinue = async () => {
    if (!validator.isEmail(email)) {
      setEmailError(true);
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/check-email`, { email });
      
      sessionStorage.setItem("emailVerificationCode",response.data.verificationCode);
      sessionStorage.setItem("verifiedEmail", email);
      if (!sessionStorage.getItem("emailVerificationCode")) {
        console.error("Verification code failed to persist in sessionStorage!");
      } 
      else {
        console.log("Verification code was stored successfully!");
      }

      if (response.data.exists) {
        setUserProgress((prev) => ({
          ...prev,
          emailChecked: true,
          emailVerified: true,
        }));
        const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user`,{ params: { email } });
        setUsername(userResponse.data.username);
        
        navigate("/email-check/login");
        setEmailExists(true);
      } 
      else {
        setUserProgress((prev) => ({
          ...prev,
          emailChecked: true,
          emailVerified: false,
        }));
        navigate("/email-check/register");
        setEmailExists(false);
      }
      setEmailCheckComplete(true);
    } 
    catch (error) {
      console.error("Error checking email:", error);
      setEmailError(true);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        t("loginRegistration.registerEmailError");
      alert(errorMessage);
    }
  };

  return (
    <div className="emailLogRegBox">
      <div className="emailTop">
        <h1><strong>{t("loginRegistration.emailGreeting")}</strong></h1>
        <p className="emailPls">{t("loginRegistration.emailPls")}</p>
        <div className={`emailLogRegInputBox ${emailError ? "Error" : ""}`} onClick={handleEmailDivClick}>
          <i className="fa-solid fa-envelope"></i>
          <input className="emailLogRegInput" placeholder={t("loginRegistration.emailPlaceholder")} value={displayEmail} ref={emailInputRef} onChange={handleEmailChange} onKeyDown={handleEmailKeyChange}/>
        </div>
        {emailError && (<p className="emailLogRegErrorMessage">{t("loginRegistration.emailWarning")}</p>)}
        <button className="emailLogRegContinue" onClick={handleEmailCheckContinue} >
          <strong>{t("loginRegistration.emailContinue")}</strong>
        </button>
        <p className="emailDontWorry">{t("loginRegistration.emailDontWorry")}</p>
      </div>
      <div className="emailDivider">
        <hr />
          <p>{t("loginRegistration.emailOr")}</p>
        <hr />
      </div>
      <div className="emailBottom">
        <p className="emailAlso">{t("loginRegistration.emailAlso")}</p>
        <div className="emailGoogle">
          <i className="fa-brands fa-google"></i>
          <p className="emailGoogleText"><strong>Google</strong></p>
        </div>
        <div className="emailFacebook">
          <i className="fa-brands fa-facebook-f"></i>
          <p className="emailFacebookText"><strong>Facebook</strong></p>
        </div>
      </div>
    </div>
  );
}
