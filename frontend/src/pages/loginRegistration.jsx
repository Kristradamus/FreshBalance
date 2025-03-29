import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { z } from 'zod';
import axios from "axios";
import logo from "../../public/images/freshBalance.png";
import LegalPolicies from "../components/LegalPolicies.jsx";
import "./loginRegistration.css";
import GoBackButton from "../components/LRGoBackButton.jsx";
import validator from "validator";

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
const [displayEmail, setDisplayEmail] = useState("");

{/*------------------------REGISTER--------------------------------}*/}
const [passwordError, setPasswordError] = useState(false);
const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
const [passwordInput, setPasswordInput] = useState("");

const [usernameError, setUsernameError] = useState(false);
const [usernameAvailable, setUsernameAvailable] = useState(true);
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

{/*RELOAD AND LEAVE SITE PREVENTER*/}
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

{/*BLOCKS THE USER FROM SKIPPING THE EMAIL CHECK*/}
useEffect(() => {
  if(currentStep==="login" || currentStep==="register" || currentStep==="terms"){
    if (!userProgress.emailChecked) {
      navigate("/email-check");
    }
  }
}, [currentStep, userProgress.emailChecked, navigate]);

{/*CHECKS ON WHICH STEP IS THE USER*/}
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

{/*IF USER GOES BACK AND CHANGES HIS EMAIL TO RESET ALL VARIABLES*/}
const handleEmailChange = (e) => {
  const rawInput = e.target.value;
  const newEmail = rawInput.trim().toLowerCase();
  setDisplayEmail(rawInput);
  setEmail(newEmail);
  
  if (userProgress.emailChecked && email !== newEmail) {
    setUserProgress({emailChecked: false, emailVerified: false, termsViewed: false});
    setEmailCheckComplete(false);
    setEmailExists(false);
    resetFormData();
  }
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

{/*INPUT-CUSTOMIZATIONS*/}
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

{/*SUBMIT-CODE*/}
const handleEmailCheckContinue = async () => {
  if (!validator.isEmail(email)) {
    setEmailError(true);
    return;
  }
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/check-email`, { email });
    sessionStorage.setItem("emailVerificationToken", response.data.token);
    sessionStorage.setItem("verifiedEmail", email);
    if (!sessionStorage.getItem('emailVerificationToken')) {
      console.error("Token failed to persist in sessionStorage!");
    }
    else{
      console.log("Token was stored successfully!")
    }

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
  } 
  catch (error) {
    console.error("Error checking email:", error);
    setEmailError(true);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || t("loginRegistration.registerEmailError");
    alert(errorMessage);
  }
};

{/*------------------------------------REGISTER-----------------------------------*/}
{/*---------------INPUT-CUSTOMIZATIONS---------------*/}
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

//PASSWORD
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
const handlePasswordVisibility = () => {
  setIsPasswordVisible(!isPasswordVisible);
};

//CONFIRM-PASSWORD
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
    handleRegistrationSubmit();
  }
};
const handleConfirmPasswordVisibility = () => {
  setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
};

//LEGAL-POLICIES
const handleTermsAcceptance = (e) => {
  setIsTermsAccepted(e.target.checked);
  setTermsError(false);
};

{/*------------REGISTRATION-SUBMIT------------*/}
const RegistrationSchema = z.object({
  username: z.string()
    .max(30, { message: t("loginRegistration.registerUsername30Chars")})
    .min(3, { message: t("loginRegistration.registerUsername3Chars")})
    .regex(/^[a-zA-Z0-9_]+$/, {message: t("loginRegistration.registerUsernameAllowedCharacters")})
    .min(1, { message: t("loginRegistration.registerUsernameRequired")})
    .trim(),
  confirmPassword: z.string()
    .min(1, { message: t("loginRegistration.registerConfirmPassword")})
    .trim(),
  password: z.string()
    .regex(/[A-Z]/, {message: t("loginRegistration.registerPasswordUpperCaseLetter")})
    .regex(/[0-9]/, { message: t("loginRegistration.registerPassword1Number")})
    .min(8, { message: t("loginRegistration.registerPassword8Chars")})
    .min(1, { message: t("loginRegistration.registerPasswordRequired")})
    .trim(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: t("loginRegistration.registerTermsRequired")}),
  })
})
.refine(data => data.password === data.confirmPassword, {
  message: t("loginRegistration.registerPasswordsDoNotMatch"),
  path: ["confirmPassword"]
});

useEffect(() => {
  const timer = setTimeout(async () => {
    if (usernameInput.trim().length > 0) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/username-check`, {
          username: usernameInput.trim()
        });
        if (!response.data.exists) {
          setUsernameAvailable(true);
          setUsernameError(false);
        }
        else {
          setUsernameAvailable(false);
          setUsernameError(true);
          setUsernameErrorMessage(t("loginRegistration.registerUsernameTaken"));
        }
      } 
      catch (error) {
        console.error("Username check failed:", error);
      }
    }
  }, 1000);

  return () => clearTimeout(timer);
}, [usernameInput]);

const handleRegistrationSubmit = async () => {
  setUsernameError(false);
  setPasswordError(false);
  setTermsError(false);

  setUsernameErrorMessage("");

  let isValid = true;

  if (!usernameAvailable) {
    setUsernameError(true);
    setUsernameErrorMessage(t("loginRegistration.registerUsernameTaken"));
    isValid = false;
  }
  
  if(isValid){
    try {
      const validatedData = await RegistrationSchema.parseAsync({
        username: usernameInput,
        password: passwordInput,
        confirmPassword: confirmPasswordInput,
        termsAccepted: isTermsAccepted
      });
      try {
        const token = sessionStorage.getItem('emailVerificationToken');
        const verifiedEmail = sessionStorage.getItem('verifiedEmail');

        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/register`, {
          email: verifiedEmail,
          token: token,
          username: validatedData.username,
          password: validatedData.password
        }, 
        {
          validateStatus: status => status >= 200 && status < 300 || status === 401
        });

        console.log('Full Response:', response);

        if(response.status === 200 || response.status === 201){
          sessionStorage.removeItem('emailVerificationToken');
          sessionStorage.removeItem('verifiedEmail');
          alert(t("loginRegistration.registrationSuccessfull"));
          navigate("/");
        }
      } 
      catch (error) {
        const errorMessage = error.response?.data?.message || t("loginRegistration.registrationFailed");
        alert(errorMessage);
        console.error("Registration failed:", error);
      }
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          switch(err.path[0]) {
            case 'username':
              setUsernameError(true);
              setUsernameErrorMessage(err.message);
              break;
            case 'password':
            case 'confirmPassword':
              setPasswordError(true);
              setPasswordErrorMessage(err.message);
              break;
            case 'termsAccepted':
              setTermsError(true);
              setTermsErrorMessage(err.message);
              break;
          }
        })
      }
    }
  }
};

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
const handleLoginSubmit = async() => {
  setPasswordError(false);
  
  let isValid = true;

  if(!passwordInput){
    setPasswordError(true);
    setPasswordErrorMessage(t("loginRegistration.loginPlsPassword"));
    isValid = false;
  }
  if(isValid){
    try{
      const verifiedEmail = sessionStorage.getItem('verifiedEmail');
      if (!verifiedEmail) {
        throw new Error("Email verification missing!");
      }
  
      const verificationToken = sessionStorage.getItem('emailVerificationToken');
  
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        email: verifiedEmail,
        password: passwordInput.trim(),
        ...(verificationToken && { token: verificationToken })
      });
  
      if (response.data.token) {
        sessionStorage.setItem('authToken', response.data.token);
      }
      
      sessionStorage.removeItem('emailVerificationToken');
      sessionStorage.removeItem('verifiedEmail');
      
      navigate("/");
  
    } catch (error) {
      if (error.message.includes("Email verification")) {
        alert(t("loginRegistration.sessionExpired"));
        navigate("/login");
      } 
      else if (error.response?.data?.error === "invalidPassword") {
        setPasswordError(true);
        setPasswordErrorMessage(t("loginRegistration.invalidPassword"));
      }
      else {
        console.error("Login error:", error);
        alert(t("loginRegistration.generalError"));
      }
    }
  };
}

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
            <input className="emailLogRegInput" placeholder={t("loginRegistration.emailPlaceholder")} value={displayEmail} ref={emailInputRef} onChange={handleEmailChange} onKeyDown={handleEmailKeyChange}/>
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
        <GoBackButton path="/email-check"/>
        <h1 className="loginWelcome">{t("loginRegistration.loginWelcome")}&nbsp;<p className="loginWelcomeUsername">{username}</p>&nbsp;!</h1>
        <i className="fa-solid fa-circle-user"></i>
        <div className="loginTop">
          <div className="registerInputErrorBox">
            <div className={`emailLogRegInputBox ${passwordError ? "Error" : ""}`} onClick={handlePasswordDivClick}>
              <i className="fa-solid fa-lock"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitlePassword") + "..."} type={isPasswordVisible ? "text" : "password"} value={passwordInput} onChange={handlePasswordChange} onKeyDown={handlePasswordKeyChange}></input>
              {isPasswordVisible ? (
                  <i className="fa-solid fa-eye-slash" onClick={handlePasswordVisibility}></i>
                ) : (
                  <i className="fa-solid fa-eye" onClick={handlePasswordVisibility}></i>
                )}
            </div>
            {passwordError && <p className="emailLogRegErrorMessage">{passwordErrorMessage}</p>}
          </div>
        </div>
        <div className="loginBottom">
          <div className={`emailLogRegCheckboxBox ${termsError ? "error" : ""}`}>
            <input type="checkbox" checked={isTermsAccepted} onChange={handleTermsAcceptance} />
            <p className="emailLogRegCheckbox">{t("loginRegistration.loginRememberMe")}</p>
          </div>
          <button className="emailLogRegContinue" onClick={handleLoginSubmit}>{t("loginRegistration.loginLogIn")}</button>
          <a className="loginForgotPassword">{t("loginRegistration.loginForgottenPassword")}</a>
        </div>
      </div>
    )}
    {/*-------------------------------------------------REGISTER-----------------------------------------------*/}
    {emailCheckComplete && !emailExists && (currentStep === "register" || currentStep === "terms") && (!isTermsVisible || currentStep !== "terms" ? (
      <div className="emailLogRegBox">
        <GoBackButton path="/email-check"/>
        <div className="registerWelcomeBox">
          <h1 className="registerWelcome">{t("loginRegistration.registerWelcome")}</h1>
          <p className="registerEmail">{email}</p>
        </div>
        <div className="registerTop">
          <div className="registerInputErrorBox">
            <div className={`emailLogRegInputBox ${usernameError ? "Error" : ""}`} onClick={handleUsernameDivClick}>
              <i className="fa-solid fa-user"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitleUsername") + "..."} value={usernameInput} onChange={handleUsernameChange} onKeyDown={handleUsernameKeyChange}/>
            </div>
            {usernameError && <p className="emailLogRegErrorMessage">{usernameErrorMessage}</p>}
          </div>
          <div className="registerInputErrorBox">
            <div className={`emailLogRegInputBox ${passwordError ? "Error" : ""}`} onClick={handlePasswordDivClick}>
              <i className="fa-solid fa-lock"></i>
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitlePassword") + "..."} type={isPasswordVisible ? "text" : "password"} value={passwordInput} onChange={handlePasswordChange} onKeyDown={handlePasswordKeyChange}/>
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
              <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitleConfirmPassword") + "..."} type={isConfirmPasswordVisible ? "text" : "password"} value={confirmPasswordInput} onChange={handleConfirmPasswordChange} onKeyDown={handleConfirmPasswordKeyChange}/>
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
            <div className={`emailLogRegCheckboxBox ${termsError ? "error" : ""}`}>
              <input type="checkbox" checked={isTermsAccepted} onChange={handleTermsAcceptance} />
              <p className="emailLogRegCheckbox">
                {t("loginRegistration.registerTerms")}&nbsp;
                <a className="emailLogRegCheckboxLink" onClick={handleTermsVisibility}><strong>{t("loginRegistration.registerLegalPolicies")}</strong></a>
              </p>
            </div>
            {termsError && <p className="emailLogRegErrorMessage">{termsErrorMessage}</p>}
          </div>
          <button className="emailLogRegContinue" onClick={handleRegistrationSubmit}>{t("loginRegistration.registerContinue")}</button>
        </div>
      </div>
    ) : (
      <div className="termsPageBox">
        <button className="termsGoBackButton" onClick={() => {navigate("/email-check/register"); setIsTermsVisible(false);}}>{t("loginRegistration.loginRegisterGoBack")}</button>
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