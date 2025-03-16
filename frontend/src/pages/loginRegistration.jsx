import { useState, useRef} from "react";
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import logo from "../../public/images/freshBalance.png";
import { Link } from 'react-router-dom';
import "./loginRegistration.css";

export default function LoginRegistration() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [hasError, setHasError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [emailCheckComplete, setEmailCheckComplete] = useState(false);
  const emailInputRef = useRef(null);
  const { t } = useTranslation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
    setHasError(false);
  };
  const handleKeyChange = (e) => {
    if(e.key === "Escape"){
      e.target.blur();
    }
    if(e.key === "Enter"){
      handleContinue();
    }
  }
  const handleBlur = () => {
    setHasError(false);
    setEmailError(false);
  }
  const handleDivClick = () => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  };

{/*---------------------------------CONTINUE-----------------------------------*/}
  const handleContinue = async () => {
    if (!validateEmail(email)) {
      setEmailError(true);
      setHasError(true);
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/check-email`, {email});
      if (response.data.exists) {
        setEmailExists(true);
      } else {
        setEmailExists(false);
      }
    setEmailCheckComplete(true);
    } 
    catch (error) {
      console.error('Error checking email:', error.response.data);
      setHasError(true);
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
            <h1><strong>{t("loginRegistration.emailGreeting")}</strong></h1>
            <p className="emailPls">{t("loginRegistration.emailPls")}</p>
            <div className={`emailInputBox ${hasError ? "Error" : ""}`} onClick={handleDivClick}>
              <input className="emailInput" placeholder={t("loginRegistration.emailPlaceholder")} value={email} ref={emailInputRef} onChange={handleEmailChange} onKeyDown={handleKeyChange} onBlur={handleBlur}/>
            </div>
            {emailError && <p className="emailErrorMessage">{t("loginRegistration.emailWarning")}</p>}
            <button className="emailContinue" onClick={handleContinue}><strong>{t("loginRegistration.emailContinue")}</strong></button>
            <p className="emailDontWorry">{t("loginRegistration.emailDontWorry")}</p>
          </div>
          <div className="emailDivider">
            <hr/>
            <p>{t("loginRegistration.emailOr")}</p>
            <hr/>
          </div>
          <div className="emailBottom">
            <p className="emailAlso">{t("loginRegistration.emailAlso")}</p>
            <div className="emailGoogle">
              <i className="fa-brands fa-google"></i>
              <button className="emailGoogleButt"><strong>Google</strong></button>
            </div>
            <div className="emailFacebook">
              <i className="fa-brands fa-facebook-f"></i>
              <button className="emailFacebookButt"><strong>Facebook</strong></button>
            </div>
          </div>
        </div>
      )}
      {emailCheckComplete && emailExists && (
        <div className="emailLogRegBox">
          <div className="loginTop">
            <h1>Login</h1>
          </div>
          <div className="loginBottom">
          </div>
        </div>
      )}
      {emailCheckComplete && !emailExists && (
        <div className="emailLogRegBox">
          <div className="registerTop">
            <h1>Register</h1>
          </div>
          <div className="registerBottom">
          </div>
        </div>
      )}
      <Link className="loginRegisterNeedHelp" to="/support"><p><strong>{t("loginRegistration.needHelp")}</strong></p></Link>
    </div>
  );
}