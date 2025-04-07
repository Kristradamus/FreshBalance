import { useState, useRef, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";
import axios from "axios";
import GoBackButton from "../reusableComponents/LRGoBackButton";

export default function Login({email, username, userProgress, setUserProgress }) {
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const { checkAuthStatus } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const passwordInputRef = useRef(null);
  const [loginFormData, setLoginFormData] = useState(() => {
    return userProgress.loginFormDataMain || {
      password: "",
      rememberMe: false
    };
  });

  /*-----------------------------------------SMALL-JS--------------------------------------------------*/
  useEffect(() => {
    if (setUserProgress) {
      setUserProgress(prevProgress => ({
        ...prevProgress,
        loginFormDataMain: loginFormData
      }));
    }
  }, [loginFormData, setUserProgress]);

  const handlePasswordChange = (e) => {
    setLoginFormData({...loginFormData, password: e.target.value});
    setPasswordError(false);
  };

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
      handleLoginSubmit();
    }
  };

  const handlePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleTermsAcceptance = (e) => {
    setLoginFormData({...loginFormData, rememberMe: e.target.checked});
    setTermsError(false);
  };

  useEffect(() => {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, []);

  /*-----------------------------------------LOGIN-SUBMIT--------------------------------------------------*/
  const handleLoginSubmit = async () => {
    setPasswordError(false);

    let isValid = true;
    if (!loginFormData.password) {
      setPasswordError(true);
      setPasswordErrorMessage(t("loginRegistration.login.plsPassword"));
      isValid = false;
    }

    if (isValid) {
      try {
        const verifiedEmail = sessionStorage.getItem("verifiedEmail");
        const verificationCode = sessionStorage.getItem("emailVerificationCode");
        
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`,{
          email: verifiedEmail,
          password: loginFormData.password.trim(),
          ...(verificationCode && { verificationCode: verificationCode }),}
        );

        if (response.data.token) {
          const lastPublicPage = sessionStorage.getItem("lastPublicPage") || "/";
          navigate(lastPublicPage, {
            state: {
              showToast: true,
              toastMessage: t("loginRegistration.login.success")
            }
          });

          if (loginFormData.rememberMe) {
            //------------------TODO----------------
            console.log("Remember me option selected.");
          }

          localStorage.setItem("authToken", response.data.token);
          console.log("Token stored successfully!");
          await checkAuthStatus();
        }
        sessionStorage.removeItem("emailVerificationCode");
        sessionStorage.removeItem("verifiedEmail");
      } 
      catch (error) {
        if (error.response?.data?.error === "Invalid password!") {
          setPasswordError(true);
          setPasswordErrorMessage(t("loginRegistration.login.invalidPassword"));
        } 
        else {
          console.error("Login error:", error);
          alert(t("loginRegistration.generalError"));
        }
      }
    }
  };

  return (
    <div className="emailLogRegBox">
      <GoBackButton path="/email-check" />
      <div className="loginWelcomeBox">
        <h1 className="loginWelcome">
          {t("loginRegistration.login.welcome")}&nbsp;{" "}
          <p className="loginWelcomeUsername">{username}</p>&nbsp;!
        </h1>
        <i className="fa-solid fa-circle-user"></i>
        <p className="registerEmail">{email}</p>
      </div>
      <div className="loginTop">
        <div className="registerInputErrorBox">
          <div className={`emailLogRegInputBox ${passwordError ? "Error" : ""}`} onClick={handlePasswordDivClick} >
            <i className="fa-solid fa-lock"></i>
            <input className="emailLogRegInput" placeholder={t("loginRegistration.login.titlePassword") + "..."} type={isPasswordVisible ? "text" : "password"} value={loginFormData.password} ref={passwordInputRef} onChange={handlePasswordChange} onKeyDown={handlePasswordKeyChange} />
            {isPasswordVisible ? (
              <i className="fa-solid fa-eye-slash" onClick={handlePasswordVisibility} ></i>
            ) : (
              <i className="fa-solid fa-eye" onClick={handlePasswordVisibility} ></i>
            )}
          </div>
          {passwordError && (<p className="emailLogRegErrorMessage">{passwordErrorMessage}</p>)}
        </div>
      </div>
      <div className="loginBottom">
        <div className={`emailLogRegCheckboxBox ${termsError ? "error" : ""}`}>
          <input type="checkbox" checked={loginFormData.rememberMe} onChange={handleTermsAcceptance}/>
          <p className="emailLogRegCheckbox">{t("loginRegistration.login.rememberMe")}</p>
        </div>
        <button className="emailLogRegContinue" onClick={handleLoginSubmit}>{t("loginRegistration.login.logIn")}</button>
        <a className="loginForgotPassword">{t("loginRegistration.login.forgottenPassword")}</a>
      </div>
    </div>
  );
}
