import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isTermsAndConditionsVisible, setIsTermsAndConditionsVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const emailInputRef = useRef(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentStep = location.pathname.split("/").pop();
  const [userProgress, setUserProgress] = useState({emailChecked:false, emailVerified:false})

{/*---------------------------------RELOAD-STOPPER-----------------------------------*/}
useEffect(() => {
  if(currentStep==="login" || currentStep==="register"){
    if (!userProgress.emailChecked) {
      navigate("/email-check");
    }
  }
}, [currentStep, userProgress.emailChecked, navigate]);

useEffect(() => {
  if (currentStep === "login") {
    setEmailCheckComplete(true);
    setEmailExists(true);
  } else if (currentStep === "register") {
    setEmailCheckComplete(true);
    setEmailExists(false);
  } else {
    setEmailCheckComplete(false);
    setEmailExists(false);
  }
}, [currentStep]);

// Reload stopper
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (email || username) {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [email, username]);

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleEmailChange = (e) => {
  setEmail(e.target.value);
  setEmailError(false);
};

const handleKeyChange = (e) => {
  if (e.key === "Escape") {
    e.target.blur();
  }
  if (e.key === "Enter") {
    handleContinue();
  }
};

const handleBlur = () => {
  setEmailError(false);
};

const handleDivClick = () => {
  if (emailInputRef.current) {
    emailInputRef.current.focus();
  }
};

const handlePasswordVisibility = () => {
  setIsPasswordVisible(!isPasswordVisible);
};

const handleConfirmPasswordVisibility = () => {
  setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
};

const handleTermsAndConditionsVisibility = () => {
  setIsTermsAndConditionsVisible(!isTermsAndConditionsVisible);
};

const handleTermsAcceptance = (e) => {
  setIsTermsAccepted(e.target.checked);
};

const handleContinue = async () => {
  if (!validateEmail(email)) {
    setEmailError(true);
    return;
  }
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/check-email`, { email });
    if (response.data.exists) {
      setUserProgress((prev) => ({ ...prev, emailChecked: true, emailVerified: true }));
      navigate("/email-check/login");
      setEmailExists(true);

      const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user`, { params: { email } });
      setUsername(userResponse.data.username);
    } else {
      setUserProgress((prev) => ({ ...prev, emailChecked: true, emailVerified: false }));
      navigate("/email-check/register");
      setEmailExists(false);
    }
    setEmailCheckComplete(true);
  } catch (error) {
    console.error("Error checking email:", error.response?.data || error.message);
    setEmailError(true);
  }
};

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
            <i className="fa-solid fa-envelope"></i>
            <input className="emailLogRegInput" placeholder={t("loginRegistration.emailPlaceholder")} value={email} ref={emailInputRef} onChange={handleEmailChange} onKeyDown={handleKeyChange} onBlur={handleBlur} />
          </div>
          {emailError && <p className="emailErrorMessage">{t("loginRegistration.emailWarning")}</p>}
          <button className="emailLogRegContinue" onClick={handleContinue}>
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

    {/* Login Section */}
    {emailCheckComplete && emailExists && currentStep === "login" && (
      <div className="emailLogRegBox">
        <button className="logRegGoBackButton" onClick={() => navigate("/")}>Go back</button>
        <h1 className="loginWelcome">Hi {username}!</h1>
        <i className="fa-thin fa-circle-user"></i>
        <div className="loginTop">
          <div className="loginPassword"></div>
        </div>
        <div className="loginBottom">
          <div className="loginRememberMeBox">
            <input className="loginRememberMe" type="checkbox" />
            <p className="loginRememberMeText">Remember me</p>
          </div>
          <button className="emailLogRegContinue">Log in</button>
          <a className="loginForgotPassword">You forgot your password, don't worry click here for a password reset</a>
        </div>
      </div>
    )}

    {/* Register Section */}
    {emailCheckComplete && !emailExists && currentStep === "register" && (!isTermsAndConditionsVisible ? (
      <div className="emailLogRegBox">
        <button className="logRegGoBackButton" onClick={() => navigate("/")}>Go back</button>
        <div className="registerWelcomeBox">
          <h1 className="registerWelcome">Create an account</h1>
          <p className="registerEmail">{email}</p>
        </div>
        <div className="registerTop">
          <div className="register">
            <div className="emailLogRegInputBox">
              <i className="fa-solid fa-user"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitleUsername") + "..."} />
            </div>
          </div>
          <div className="register">
            <div className="emailLogRegInputBox">
              <i className="fa-solid fa-lock"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitlePassword") + "..."} type={isPasswordVisible ? "text" : "password"} />
              {isPasswordVisible ? (
                <i className="fa-solid fa-eye-slash" onClick={handlePasswordVisibility}></i>
              ) : (
                <i className="fa-solid fa-eye" onClick={handlePasswordVisibility}></i>
              )}
            </div>
          </div>
          <div className="register">
            <div className="emailLogRegInputBox">
              <i className="fa-solid fa-lock"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitleConfirmPassword") + "..."} type={isConfirmPasswordVisible ? "text" : "password"} />
              {isConfirmPasswordVisible ? (
                <i className="fa-solid fa-eye-slash" onClick={handleConfirmPasswordVisibility}></i>
              ) : (
                <i className="fa-solid fa-eye" onClick={handleConfirmPasswordVisibility}></i>
              )}
            </div>
          </div>
        </div>
        <div className="registerBottom">
          <div className="registerTermsAndConditionsBox">
            <input type="checkbox" checked={isTermsAccepted} onChange={handleTermsAcceptance} />
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
);
}