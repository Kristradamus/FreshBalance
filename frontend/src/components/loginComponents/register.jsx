import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { z } from 'zod';
import GoBackButton from "../reusableComponents/LRGoBackButton";

export default function Register({ email, setIsTermsVisible, userProgress, setUserProgress }) {
const { t } = useTranslation();
const navigate = useNavigate();

// PASSWORD STATES
const [passwordError, setPasswordError] = useState(false);
const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
const [passwordInput, setPasswordInput] = useState("");
const [isPasswordVisible, setIsPasswordVisible] = useState(false);
const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

// USERNAME STATES
const [usernameError, setUsernameError] = useState(false);
const [usernameAvailable, setUsernameAvailable] = useState(true);
const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
const [usernameInput, setUsernameInput] = useState("");

// TERMS STATES
const [termsError, setTermsError] = useState(false);
const [termsErrorMessage, setTermsErrorMessage] = useState("");
const [isTermsAccepted, setIsTermsAccepted] = useState(false);

// REFS
const usernameInputRef = useRef(null);
const passwordInputRef = useRef(null);
const confirmPasswordInputRef = useRef(null);

/*------------------------------------INPUT-CUSTOMIZATIONS------------------------------------*/
useEffect (() => {
  if(usernameInputRef.current){
    usernameInputRef.current.focus();
  }
}, [])

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

// PASSWORD
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

// CONFIRM PASSWORD
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

// Terms
const handleTermsAcceptance = (e) => {
  setIsTermsAccepted(e.target.checked);
  setTermsError(false);
};

const handleTermsVisibility = () => {
  setIsTermsVisible(true);
  navigate("/email-check/terms");
  setUserProgress((prev) => ({ ...prev, termsViewed: true }));
};

/*------------------------------------USERNAME-AVAILABILITY-CHECK------------------------------------*/
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
}, [usernameInput, t]);

/*------------------------------------ZOD-VALIDATION-SCHEMA------------------------------------*/
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

/*------------------------------------REGISTRATION-SUBMIT------------------------------------*/
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
        const verificationCode = sessionStorage.getItem('emailVerificationCode');
        const verifiedEmail = sessionStorage.getItem('verifiedEmail');
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/register`, {
          email: verifiedEmail,
          verificationCode: verificationCode,
          username: validatedData.username,
          password: validatedData.password
        }, 
        {
          validateStatus: status => status >= 200 && status < 300 || status === 401
        });
        console.log('Full Response:', response);
        if(response.status === 200 || response.status === 201){
          sessionStorage.removeItem('emailVerificationCode');
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
return (
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
          <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitleUsername") + "..."} value={usernameInput} ref={usernameInputRef} onChange={handleUsernameChange} onKeyDown={handleUsernameKeyChange}/>
        </div>
        {usernameError && <p className="emailLogRegErrorMessage">{usernameErrorMessage}</p>}
      </div>
      <div className="registerInputErrorBox">
        <div className={`emailLogRegInputBox ${passwordError ? "Error" : ""}`} onClick={handlePasswordDivClick}>
          <i className="fa-solid fa-lock"></i>
          <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitlePassword") + "..."} type={isPasswordVisible ? "text" : "password"} value={passwordInput} ref={passwordInputRef}onChange={handlePasswordChange} onKeyDown={handlePasswordKeyChange}/>
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
          <input className="emailLogRegInput" placeholder={t("loginRegistration.registerTitleConfirmPassword") + "..."} type={isConfirmPasswordVisible ? "text" : "password"} value={confirmPasswordInput} ref={confirmPasswordInputRef}onChange={handleConfirmPasswordChange} onKeyDown={handleConfirmPasswordKeyChange}/>
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
            <a className="emailLogRegCheckboxLink" onClick={handleTermsVisibility}>
              <strong>{t("loginRegistration.registerLegalPolicies")}</strong>
            </a>
          </p>
        </div>
        {termsError && <p className="emailLogRegErrorMessage">{termsErrorMessage}</p>}
      </div>
      <button className="emailLogRegContinue" onClick={handleRegistrationSubmit}>
        {t("loginRegistration.registerContinue")}
      </button>
    </div>
  </div>
);};