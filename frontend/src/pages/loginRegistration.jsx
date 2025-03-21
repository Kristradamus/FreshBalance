import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import logo from "../../public/images/freshBalance.png";
import TermsAndConditions from "../components/LegalPolicies.jsx";
import { Link } from "react-router-dom";
import "./loginRegistration.css";

export default function LoginRegistration() {
const [email, setEmail] = useState("");
const [emailError, setEmailError] = useState(false);
const [emailExists, setEmailExists] = useState(false);
const [emailCheckComplete, setEmailCheckComplete] = useState(false);
const [isPasswordVisible, setIsPasswordVissible] = useState(false);
const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
const [isTermsAndConditionsVisible, setIsTermsAndConditionsVisible] = useState(false);
const [username, setUsername] = useState("");
const [formData, setFormData] = useState({username: "", password: "", confirmPassword: "",});
const emailInputRef = useRef(null);
const { t } = useTranslation();
const registerData = t("loginRegistration.registerData", {returnObject: true,});

{/*---------------------------------RELOAD-STOPPER-----------------------------------*/}
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if 
    (
      email ||
      formData.username ||
      formData.password ||
      formData.confirmPassword
    ) 
    {
      e.preventDefault();
      e.returnValue =
      "You have unsaved changes. Are you sure you want to leave?";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [email, formData]);

{/*--------------------------SMALL-JS------------------------------------------*/}
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleEmailChange = (e) => {
  setEmail(e.target.value);
  setEmailError(false);
};

const handleKeyChange = (e) => {
  if (e.key === "Escape")
  {
    e.target.blur();
  }
  if (e.key === "Enter")
  {
    handleContinue();
  }
};
  
const handleBlur = () => {
  setEmailError(false);
};

const handleDivClick = () => {
  if (emailInputRef.current) 
  {
    emailInputRef.current.focus();
  }
};

const handlePasswordVisibility = () => {
  setIsPasswordVissible(!isPasswordVisible);
};

const handleConfirmPasswordVisibility = () => {
  setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
};

const handleTermsAndConditionsVisibility = () => {
  setIsTermsAndConditionsVisible(!isTermsAndConditionsVisible);
};

{/*---------------------------------CONTINUE-----------------------------------*/}
const handleContinue = async () => {
  if (!validateEmail(email)) {
    setEmailError(true);
    return;
  }
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/check-email`,
      { email }
    );
    if (response.data.exists)
    {
      setEmailExists(true);

      { /*---------------------------------GET-USERNAME-----------------------------------*/}
      const userResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user`,
        { params: { email } }
      );
      setUsername(userResponse.data.username);
    } 
    else 
    {
      setEmailExists(false);
    }
    setEmailCheckComplete(true);
  }   
  catch (error) {
    console.error("Error checking email:", error.response.data);
    setEmailError(true);
  }
};

{/*---------------------------------MAIN-----------------------------------*/}
return (
  <div className="loginRegister">
    <Link to="/">
      <img className="loginRegisterLogo" src={logo} alt="Fresh Balance" />
    </Link>
    {!emailCheckComplete && (
      <div className="emailLogRegBox">
        <div className="emailTop">
          <h1>
            <strong>{t("loginRegistration.emailGreeting")}</strong>
          </h1>
          <p className="emailPls">{t("loginRegistration.emailPls")}</p>
          <div className={`emailLogRegInputBox ${emailError ? "Error" : ""}`} onClick={handleDivClick}>
            <i class="fa-solid fa-envelope"></i>
            <input className="emailLogRegInput" placeholder={t("loginRegistration.emailPlaceholder")} value={email} ref={emailInputRef} onChange={handleEmailChange} onKeyDown={handleKeyChange} onBlur={handleBlur}/>
          </div>
          {emailError && (
            <p className="emailErrorMessage">
              {t("loginRegistration.emailWarning")}
            </p>
          )}
          <button className="emailLogRegContinue" onClick={handleContinue}>
            <strong>{t("loginRegistration.emailContinue")}</strong>
          </button>
          <p className="emailDontWorry">
            {t("loginRegistration.emailDontWorry")}
          </p>
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
            <p className="emailGoogleText">
              <strong>Google</strong>
            </p>
          </div>
          <div className="emailFacebook">
            <i className="fa-brands fa-facebook-f"></i>
            <p className="emailFacebookText">
              <strong>Facebook</strong>
            </p>
          </div>
        </div>
      </div>
    )}

    {/*---------------------------------LOGIN-----------------------------------*/}
    {emailCheckComplete && emailExists && (
      <div className="emailLogRegBox">
        <button className="logRegGoBackButton" onClick={() => {setEmailCheckComplete(false);}}>Go back</button>
        <h1 className="loginWelcome">Hi {username}!</h1>
        <i class="fa-thin fa-circle-user"></i>
        <div className="loginTop">
          <div className="loginPassword"></div>
        </div>
        <div className="loginBottom">
          <div className="loginRememberMeBox">
            <input className="loginRememberMe" type="checkbox"></input>
            <p className="loginRememberMeText">Remember me</p>
          </div>
          <button className="emailLogRegContinue">Log in</button>
          <a className="loginForgotPassword">You forgot your password, dont worry click here for a password reset</a>
        </div>
      </div>
    )}

    {/*---------------------------------REGISTER-----------------------------------*/}
    {emailCheckComplete && !emailExists && (!isTermsAndConditionsVisible ? (
      <div className="emailLogRegBox">
        <button className="logRegGoBackButton" onClick={() => {setEmailCheckComplete(false);}}>Go back</button>
        <div className="registerWelcomeBox">
          <h1 className="registerWelcome">Create an account</h1>
          <p className="registerEmail">{email}</p>
        </div>
        <div className="registerTop">
          <div className="register">
            <div className="emailLogRegInputBox">
              <i class="fa-solid fa-user"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitleUsername") + "..."}></input>
            </div>
          </div>
          <div className="register">
            <div className="emailLogRegInputBox">
              <i class="fa-solid fa-lock"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitlePassword") + "..."} type={isPasswordVisible ? "text" : "password"}></input>
              {isPasswordVisible ? (
                <i class="fa-solid fa-eye-slash" onClick={handlePasswordVisibility}></i>
              ) : (
                <i class="fa-solid fa-eye" onClick={handlePasswordVisibility}></i>
              )}
            </div>
          </div>
          <div className="register">
            <div className="emailLogRegInputBox">
              <i class="fa-solid fa-lock"></i>
              <input className="emailLogRegInput" placeholder={   t("loginRegistration.registerTitleConfirmPassword") +   "..." } type={isConfirmPasswordVisible ? "text" : "password"}></input>
              {isConfirmPasswordVisible ? (
                <i class="fa-solid fa-eye-slash" onClick={handleConfirmPasswordVisibility}></i>
              ) : (
                <i class="fa-solid fa-eye" onClick={handleConfirmPasswordVisibility}></i>
              )}
            </div>
          </div>
        </div>
        <div className="registerBottom">
          <div className="registerTermsAndConditionsBox">
            <input type="checkbox"></input>
            <p className="registerTermsAndConditions">
              {t("loginRegistration.termsAndConditions")}&nbsp;
              <a className="registerTermsAndConditionsLink" onClick={handleTermsAndConditionsVisibility}><strong>Legal Policies</strong></a>
            </p>
          </div>
          <button className="emailLogRegContinue">{t("loginRegistration.registerContinue")}</button>
        </div>
      </div>
      ) : (
      <div className="termsAndConditionsBox">
        <TermsAndConditions />
      </div>
    ))}
    <Link className="loginRegisterNeedHelp" to="/support">
      <p>
        <strong>{t("loginRegistration.needHelp")}</strong>
      </p>
    </Link>
  </div>
);};
