import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import "./loginRegistration.css";
import logo from "../../public/images/freshBalance.png";
import { Link } from 'react-router-dom';

export default function LoginRegistration() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [hasError, setHasError] = useState("");
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

  const handleContinue = () => {
    if (!validateEmail(email)) {
      setEmailError(true);
      setHasError(true)
    } 
    else 
    {
      setEmailError("");
      setHasError("false");
    }
  };

  return (
    <div className="loginRegister">
      <Link to="/">
        <img className="loginRegisterLogo" src={logo} alt="Fresh Balance" />
      </Link>
      <div className="emailBox">
        <div className="emailTop">
          <h1><strong>{t("loginRegistration.emailGreeting")}</strong></h1>
          <p className="emailPls">{t("loginRegistration.emailPls")}</p>
          <div className={`emailInputBox ${hasError ? "Error" : ""}`}>
            <input className="emailInput" placeholder={t("loginRegistration.emailPlaceholder")} value={email} onChange={handleEmailChange}/>
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
        {/*<div className="logRegLogin">
          <h3>Hello <a href="#">username</a>!</h3>
          <i class="fa-regular fa-user"></i>
        </div>
        <div className="logRegRegister">
        </div>*/}
      </div>
      <Link className="loginRegisterNeedHelp" to="/support"><p><strong>{t("loginRegistration.needHelp")}</strong></p></Link>
    </div>
  );
}
