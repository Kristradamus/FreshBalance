import { useState, useRef, useEffect} from "react";
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import logo from "../../public/images/freshBalance.png";
import { Link } from 'react-router-dom';
import "./loginRegistration.css";

export default function LoginRegistration() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailCheckComplete, setEmailCheckComplete] = useState(false);
  const [isPasswordVisible, setIsPasswordVissible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isTermsAndConditionsVisible, setIsTermsAndConditionsVisible] = useState(false);
  const [username, setUsername] = useState("")
  const [formData, setFormData] = useState({
  username:"",
  password:"",
  confirmPassword:""
  })

  const emailInputRef = useRef(null);
  const { t } = useTranslation();
  const registerData = t("loginRegistration.registerData", {returnObject: true});

{/*---------------------------------RELOAD-STOPPER-----------------------------------*/}
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (email || formData.username || formData.password || formData.confirmPassword) {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
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
    if(e.key === "Escape"){
      e.target.blur();
    }
    if(e.key === "Enter"){
      handleContinue();
    }
  }
  const handleBlur = () => {
    setEmailError(false);
  }
  const handleDivClick = () => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  };
  const handlePasswordVisibility = () => {
    setIsPasswordVissible(!isPasswordVisible);
  }
  const handleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  }
  const handleTermsAndConditionsVisibility = () => {
    setIsTermsAndConditionsVisible(!isTermsAndConditionsVisible);
  }
{/*---------------------------------CONTINUE-----------------------------------*/}
  const handleContinue = async () => {
    if (!validateEmail(email)) {
      setEmailError(true);
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/check-email`, {email});
      if (response.data.exists) {
        setEmailExists(true);

        {/*---------------------------------GET-USERNAME-----------------------------------*/}
        const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user`, {params: { email }});
        setUsername(userResponse.data.username);
      } else {
        setEmailExists(false);
      }
    setEmailCheckComplete(true);
    } 
    catch (error) {
      console.error('Error checking email:', error.response.data);
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
            <div className={`emailLogRegInputBox ${emailError ? "Error" : ""}`} onClick={handleDivClick}>
              <i class="fa-solid fa-envelope"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.emailPlaceholder")} value={email} ref={emailInputRef} onChange={handleEmailChange} onKeyDown={handleKeyChange} onBlur={handleBlur}/>
            </div>
            {emailError && <p className="emailErrorMessage">{t("loginRegistration.emailWarning")}</p>}
            <button className="emailLogRegContinue" onClick={handleContinue}><strong>{t("loginRegistration.emailContinue")}</strong></button>
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
              <p className="emailGoogleText"><strong>Google</strong></p>
            </div>
            <div className="emailFacebook">
              <i className="fa-brands fa-facebook-f"></i>
              <p className="emailFacebookText"><strong>Facebook</strong></p>
            </div>
          </div>
        </div>
      )}
      {/*---------------------------------LOGIN-----------------------------------*/}
      {emailCheckComplete && emailExists && (
        <div className="emailLogRegBox">
          <button className="logRegGoBackButton" onClick={() => {setEmailCheckComplete(false)}}>Go back</button>
          <h1 className="loginWelcome">Hi {username}!</h1>
          <i class="fa-thin fa-circle-user"></i>
          <div className="loginTop">
            <div className="loginPassword">
            </div>
          </div>
          <div className="loginBottom">
            <div className="loginRememberMeBox">
              <input className="loginRememberMe" type="checkbox" ></input>
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
          <button className="logRegGoBackButton" onClick={() => {setEmailCheckComplete(false)}}>Go back</button>
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
                {isPasswordVisible ? <i class="fa-solid fa-eye-slash" onClick={handlePasswordVisibility}></i> : <i class="fa-solid fa-eye" onClick={handlePasswordVisibility}></i>}
              </div>
            </div>
            <div className="register">
              <div className="emailLogRegInputBox">
                <i class="fa-solid fa-lock"></i>
                <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitleConfirmPassword") + "..."} type={isConfirmPasswordVisible ? "text" : "password"}></input>
                {isConfirmPasswordVisible ? <i class="fa-solid fa-eye-slash" onClick={handleConfirmPasswordVisibility}></i> : <i class="fa-solid fa-eye" onClick={handleConfirmPasswordVisibility}></i>}
              </div>
            </div>
          </div>
          <div className="registerBottom">
            <div className="registerTermsAndConditionsBox">
              <input type="checkbox"></input>
              <p className="registerTermsAndConditions">{t("loginRegistration.termsAndConditions")}&nbsp;<a className="registerTermsAndConditionsLink" onClick={handleTermsAndConditionsVisibility}><strong>Terms and Conditions</strong></a></p>
            </div>
            <button className="emailLogRegContinue">{t("loginRegistration.registerContinue")}</button>
          </div>
        </div>
      ) : (
        <div className="terms-and-conditions">
          <h1>Terms and Conditions</h1>
          <p>
            Welcome to <strong>[Your Website Name]</strong>! These terms and conditions outline the rules and regulations for the use of <strong>[Your Website Name]</strong>'s services, located at <strong>[Your Website URL]</strong>.
          </p>
          <p>
            By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use <strong>[Your Website Name]</strong> if you do not agree to all of the terms and conditions stated on this page.
          </p>
    
          <h2>1. Intellectual Property Rights</h2>
          <p>
            Unless otherwise stated, <strong>[Your Website Name]</strong> and/or its licensors own the intellectual property rights for all material on <strong>[Your Website Name]</strong>. All intellectual property rights are reserved. You may access this from <strong>[Your Website Name]</strong> for your personal use, subject to the restrictions set in these terms and conditions.
          </p>
          <p>
            You must not:
          </p>
          <ul>
            <li>Republish material from <strong>[Your Website Name]</strong> without prior written consent.</li>
            <li>Sell, rent, or sub-license material from <strong>[Your Website Name]</strong>.</li>
            <li>Reproduce, duplicate, or copy material from <strong>[Your Website Name]</strong> for commercial purposes.</li>
            <li>Redistribute content from <strong>[Your Website Name]</strong> unless content is specifically made for redistribution.</li>
          </ul>
    
          <h2>2. User Responsibilities</h2>
          <p>
            By using <strong>[Your Website Name]</strong>, you agree to the following:
          </p>
          <ul>
            <li>You will not use this website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.</li>
            <li>You will not use this website for any unlawful, illegal, fraudulent, or harmful purpose or activity.</li>
            <li>You will not conduct any systematic or automated data collection activities (including scraping, data mining, data extraction, or data harvesting) without our prior written consent.</li>
            <li>You will not use this website to copy, store, host, transmit, send, use, publish, or distribute any material that consists of (or is linked to) any spyware, computer virus, Trojan horse, worm, keystroke logger, rootkit, or other malicious computer software.</li>
          </ul>
    
          <h2>3. Privacy Policy</h2>
          <p>
            Your use of <strong>[Your Website Name]</strong> is also governed by our <a href="/privacy-policy">Privacy Policy</a>, which explains how we collect, use, and protect your personal information. By using this website, you consent to the terms of our Privacy Policy.
          </p>
    
          <h2>4. Limitation of Liability</h2>
          <p>
            In no event shall <strong>[Your Website Name]</strong>, nor any of its officers, directors, or employees, be liable for anything arising out of or in any way connected with your use of this website. <strong>[Your Website Name]</strong>, including its officers, directors, and employees, shall not be liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this website.
          </p>
    
          <h2>5. Indemnification</h2>
          <p>
            You hereby indemnify <strong>[Your Website Name]</strong> to the fullest extent from and against any and all liabilities, costs, demands, causes of action, damages, and expenses (including reasonable attorney’s fees) arising out of or in any way related to your breach of any of the provisions of these terms.
          </p>
    
          <h2>6. Severability</h2>
          <p>
            If any provision of these terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein. The remaining provisions will continue to be valid and enforceable.
          </p>
    
          <h2>7. Variation of Terms</h2>
          <p>
            <strong>[Your Website Name]</strong> is permitted to revise these terms at any time as it sees fit. By using this website, you are expected to review these terms regularly to ensure you understand all terms and conditions governing its use. Your continued use of the website after any changes to these terms constitutes your acceptance of the revised terms.
          </p>
    
          <h2>8. Assignment</h2>
          <p>
            <strong>[Your Website Name]</strong> is allowed to assign, transfer, and subcontract its rights and/or obligations under these terms without any notification or consent required. However, you are not allowed to assign, transfer, or subcontract any of your rights and/or obligations under these terms.
          </p>
    
          <h2>9. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of <strong>[Your Country/State]</strong>, and you submit to the non-exclusive jurisdiction of the courts located in <strong>[Your Country/State]</strong> for the resolution of any disputes.
          </p>
    
          <h2>10. Entire Agreement</h2>
          <p>
            These terms constitute the entire agreement between <strong>[Your Website Name]</strong> and you in relation to your use of this website and supersede all prior agreements and understandings.
          </p>
    
          <h2>11. Contact Information</h2>
          <p>
            If you have any questions about these terms and conditions, please contact us at:
          </p>
          <ul>
            <li>Email: <a href="mailto:support@yourwebsite.com">support@yourwebsite.com</a></li>
            <li>Phone: <strong>[Your Phone Number]</strong></li>
            <li>Address: <strong>[Your Company Address]</strong></li>
          </ul>
          <p>
            <strong>Last Updated:</strong> [Insert Date]
          </p>
        </div>
      ))}
      <Link className="loginRegisterNeedHelp" to="/support"><p><strong>{t("loginRegistration.needHelp")}</strong></p></Link>
    </div>
  );
}