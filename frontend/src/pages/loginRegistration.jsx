import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../../public/images/freshBalance.png";
import LegalPolicies from "../components/LegalPolicies.jsx";
import { Link } from "react-router-dom";
import "./loginRegistration.css";

export default function LoginRegistration() {
const emailInputRef = useRef(null);
const navigate = useNavigate();
const location = useLocation();
const { t } = useTranslation();
const currentStep = location.pathname.split("/").pop();
const [userProgress, setUserProgress] = useState({emailChecked:false, emailVerified:false, termsViewed:false});

{/*------------------------EMAIL-CHECK--------------------------------}*/}
const [emailError, setEmailError] = useState(false);
const [emailExists, setEmailExists] = useState(false);
const [emailCheckComplete, setEmailCheckComplete] = useState(false);
const [email, setEmail] = useState("");

{/*------------------------REGISTER--------------------------------}*/}
const [passwordError, setPasswordError] = useState(false);
const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
const [passwordInput, setPasswordInput] = useState("");

const [usernameError, setUsernameError] = useState(false);
const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
const [usernameInput, setUsernameInput] = useState("");

const usernameInputRef = useRef(null);
const passwordInputRef = useRef(null);
const confirmPasswordInputRef = useRef(null);

const [termsError, setTermsError] = useState(false);
const [termsErrorMessage, setTermsErrorMessage] = useState("")
const [isTermsAccepted, setIsTermsAccepted] = useState(false);

const [isPasswordVisible, setIsPasswordVisible] = useState(false);
const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
const [isTermsVisible, setIsTermsVisible] = useState(false);

{/*------------------------LOGIN--------------------------------}*/}
const [username, setUsername] = useState("");

{/*---------------------------------RELOAD-STOPPER-----------------------------------*/}

//This is reload and leave-site preventer
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (email) {
      e.preventDefault();
      e.returnValue = "";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [email]);

//This blocks the user from skipping the email-check
useEffect(() => {
  if(currentStep==="login" || currentStep==="register" || currentStep==="terms"){
    if (!userProgress.emailChecked) {
      navigate("/email-check");
    }
  }
}, [currentStep, userProgress.emailChecked, navigate]);

//This checks on which step is the user
useEffect(() => {
  if (currentStep === "login") {
    setEmailCheckComplete(true);
    setEmailExists(true);
  } 
  else if (currentStep === "register") {
    setEmailCheckComplete(true);
    setEmailExists(false);
  } 
  else if(currentStep === "terms"){
    setEmailCheckComplete(true);
    setEmailExists(false);
    setIsTermsVisible(true);
  }
  else {
    setEmailCheckComplete(false);
    setEmailExists(false);
  }
}, [currentStep]);

{/*---------------------------------EMAIL-CHECK-----------------------------------*/}
const handleEmailChange = (e) => {
  const newEmail = e.target.value;
  
  if (userProgress.emailChecked && email !== newEmail) {
    setUserProgress({emailChecked: false, emailVerified: false, termsViewed: false});
    setEmailCheckComplete(false);
    setEmailExists(false);
    resetFormData();
  }
  
  setEmail(newEmail);
  setEmailError(false);
};
const resetFormData = () => {
  setPasswordInput("");
  setConfirmPasswordInput("");
  setUsernameInput("");
  
  setEmailError(false);
  setPasswordError(false);
  setUsernameError(false);
  setTermsError(false);

  setPasswordErrorMessage("");
  setUsernameErrorMessage("");
  setTermsErrorMessage("");
  
  setIsTermsAccepted(false);
  
  setIsPasswordVisible(false);
  setIsConfirmPasswordVisible(false);
  setIsTermsVisible(false);
};

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
const handleEmailBlur = () => {
  setEmailError(false);
};
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleEmailCheckContinue = async () => {
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

{/*------------------------------------REGISTER-----------------------------------*/}

{/*---------------USERNAME---------------*/}
const handleUsernameChange = (e) => {
  setUsernameInput(e.target.value);
  setUsernameError(false);
}
const handleUsernameDivClick = () => {
  if (usernameInputRef.current) {
    usernameInputRef.current.focus();
  }
};
const handleUsernameKeyChange = (e) => {
  if (e.key === "Escape") {
    e.target.blur();
  }
  if (e.key === "Enter") {
    passwordInputRef.current.focus();
  }
};
const handleUsernameBlur = () => {
  setUsernameError(false);
};

{/*---------------PASSWORD---------------*/}
const handlePasswordChange = (e) => {
  setPasswordInput(e.target.value);
  setPasswordError(false);
}
const handlePasswordDivClick = () => {
  if (passwordInputRef.current) {
    passwordInputRef.current.focus();
  }
};
const handlePasswordKeyChange = (e) => {
  if (e.key === "Escape") {
    e.target.blur();
  }
  if (e.key === "Enter") {
    confirmPasswordInputRef.current.focus();
  }
};
const handlePasswordBlur = () => {
  setPasswordError(false);
};

{/*------------CONFIRM-PASSWORD------------*/}
const handleConfirmPasswordChange = (e) => {
  setConfirmPasswordInput(e.target.value);
  setPasswordError(false);
}
const handleConfirmPasswordDivClick = () => {
  if (confirmPasswordInputRef.current) {
    confirmPasswordInputRef.current.focus();
  }
};
const handleConfirmPasswordKeyChange = (e) => {
  if (e.key === "Escape") {
    e.target.blur();
  }
  if (e.key === "Enter") {
    hadnleRegistrationSubmit();
  }
};
const handleConfirmPasswordBlur = () => {
  setPasswordError(false);
};

{/*------------OTHER-STUFF------------*/}
const handleTermsAcceptance = (e) => {
  setIsTermsAccepted(e.target.checked);
  setTermsError(false);
};
const handlePasswordVisibility = () => {
  setIsPasswordVisible(!isPasswordVisible);
};
const handleConfirmPasswordVisibility = () => {
  setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
};

const hadnleRegistrationSubmit = async () => {
  setUsernameError(false);
  setPasswordError(false);
  setTermsError(false);

  let isValid = true;

  if(!usernameInput.trim()){
    setUsernameError(true);
    setUsernameErrorMessage(t("loginRegistration.registerUsernameRequired"));
    isValid = false;
  }

  if(!passwordInput.trim()){
    setPasswordError(true);
    setPasswordErrorMessage(t("loginRegistration.registerPasswordRequired"));
    isValid = false;
  }
  else if(passwordInput.trim() !== confirmPasswordInput.trim()){
    setPasswordError(true);
    setPasswordErrorMessage(t("loginRegistration.registerPasswordsDoNotMatch"));
    isValid = false;
  }

  if(!isTermsAccepted){
    setTermsError(true);
    setTermsErrorMessage(t("loginRegistration.registerTermsRequired"))
    isValid = false;
  }

  if(isValid === true){
    navigate("/email-check");
  }
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/username-check`, {username: usernameInput});
    if (response.data.exists) {
      setUsernameError(true);
      setUsernameErrorMessage(t("loginRegistration.registerUsernameTaken"));
      return;
    }

    console.log("Registration valid, proceeding with signup");
    
  } catch (error) {
    console.error("Error checking username:", error.response?.data || error.message);
  }
}
{/*--------------LEGAL-POLICIES----------------*/}
const handleTermsVisibility = () => {
  const newVisibility = !isTermsVisible;
  setIsTermsVisible(newVisibility);
  if (newVisibility){
    navigate("/email-check/terms");
    setUserProgress((prev) => ({ ...prev, termsViewed: true }));
  } else {
    navigate("/email-check/register");
  }
};

{/*------------------------------------LOGIN--------------------------------------*/}

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
          <div className={`emailLogRegInputBox ${emailError ? "Error" : ""}`} onClick={handleEmailDivClick}>
            <i className="fa-solid fa-envelope"></i>
            <input className="emailLogRegInput" placeholder={t("loginRegistration.emailPlaceholder")} value={email} ref={emailInputRef} onChange={handleEmailChange} onKeyDown={handleEmailKeyChange} onBlur={handleEmailBlur} />
          </div>
          {emailError && <p className="emailLogRegErrorMessage">{t("loginRegistration.emailWarning")}</p>}
          <button className="emailLogRegContinue" onClick={handleEmailCheckContinue}>
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

    {/*-------------------------------------------------LOGIN---------------------------------------------------*/}
    {emailCheckComplete && emailExists && currentStep === "login" && (
      <div className="emailLogRegBox">
        <button className="logRegGoBackButton" onClick={() => navigate("/email-check")}>Go back</button>
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

    {/*-------------------------------------------------REGISTER-----------------------------------------------*/}
    {emailCheckComplete && !emailExists && (currentStep === "register" || currentStep === "terms") && (!isTermsVisible || currentStep !== "terms" ? (
      <div className="emailLogRegBox">
        <button className="logRegGoBackButton" onClick={() => navigate("/email-check")}>Go back</button>
        <div className="registerWelcomeBox">
          <h1 className="registerWelcome">Create an account</h1>
          <p className="registerEmail">{email}</p>
        </div>
        <div className="registerTop">
          <div className="registerInputErrorBox">
            <div className={`emailLogRegInputBox ${usernameError ? "Error" : ""}`} onClick={handleUsernameDivClick}>
              <i className="fa-solid fa-user"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitleUsername") + "..."} value={usernameInput} onChange={handleUsernameChange} onKeyDown={handleUsernameKeyChange} onBlur={handleUsernameBlur}/>
            </div>
            {usernameError && <p className="emailLogRegErrorMessage">{usernameErrorMessage}</p>}
          </div>
          <div className="registerInputErrorBox">
            <div className={`emailLogRegInputBox ${passwordError ? "Error" : ""}`} onClick={handlePasswordDivClick}>
              <i className="fa-solid fa-lock"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitlePassword") + "..."} type={isPasswordVisible ? "text" : "password"} value={passwordInput} onChange={handlePasswordChange} onKeyDown={handlePasswordKeyChange} onBlur={handlePasswordBlur}/>
              {isPasswordVisible ? (
                <i className="fa-solid fa-eye-slash" onClick={handlePasswordVisibility}></i>
              ) : (
                <i className="fa-solid fa-eye" onClick={handlePasswordVisibility}></i>
              )}
            </div>
          </div>
          <div className="registerInputErrorBox">
            <div className={`emailLogRegInputBox ${passwordError ? "Error" : ""}`} onClick={handleConfirmPasswordDivClick}>
              <i className="fa-solid fa-lock"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitleConfirmPassword") + "..."} type={isConfirmPasswordVisible ? "text" : "password"} value={confirmPasswordInput} onChange={handleConfirmPasswordChange} onKeyDown={handleConfirmPasswordKeyChange} onBlur={handleConfirmPasswordBlur}/>
              {isConfirmPasswordVisible ? (
                <i className="fa-solid fa-eye-slash" onClick={handleConfirmPasswordVisibility}></i>
              ) : (
                <i className="fa-solid fa-eye" onClick={handleConfirmPasswordVisibility}></i>
              )}
            </div>
            {passwordError && <p className="emailLogRegErrorMessage">{passwordErrorMessage}</p>}
          </div>
        </div>
        <div className="registerBottom">
          <div className="registerInputErrorBox">
            <div className={`registerTermsAndConditionsBox ${termsError ? "error" : ""}`}>
              <input type="checkbox" checked={isTermsAccepted} onChange={handleTermsAcceptance} />
              <p className="registerTermsAndConditions">
                {t("loginRegistration.termsAndConditions")}&nbsp;
                <a className="registerTermsAndConditionsLink" onClick={handleTermsVisibility}><strong>Legal Policies</strong></a>
              </p>
            </div>
            {termsError && <p className="emailLogRegErrorMessage">{termsErrorMessage}</p>}
          </div>
          <button className="emailLogRegContinue" onClick={hadnleRegistrationSubmit}>{t("loginRegistration.registerContinue")}</button>
        </div>
      </div>
    ) : (
      <div className="termsPageBox">
        <button className="termsGoBackButton" onClick={() => {navigate("/email-check/register"); setIsTermsVisible(false);}}>Go back</button>
        <LegalPolicies />
      </div>
    ))}
    <Link className="loginRegisterNeedHelp" to="/support">
      <p>
        <strong>{t("loginRegistration.needHelp")}</strong>
      </p>
    </Link>
  </div>
);};