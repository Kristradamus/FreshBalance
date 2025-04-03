import { useState, useRef, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";
import axios from "axios";
import GoBackButton from "../reusableComponents/LRGoBackButton";

export default function Login({ username }) {
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const { checkAuthStatus } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const passwordInputRef = useRef(null);

  /*-----------------------------------------SMALL-JS--------------------------------------------------*/
  const handlePasswordChange = (e) => {
    setPasswordInput(e.target.value);
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
    setIsTermsAccepted(e.target.checked);
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
    if (!passwordInput) {
      setPasswordError(true);
      setPasswordErrorMessage(t("loginRegistration.loginPlsPassword"));
      isValid = false;
    }

    if (isValid) {
      try {
        const verifiedEmail = sessionStorage.getItem("verifiedEmail");
        if (!verifiedEmail) {
          throw new Error("Email verification missing!");
        }

        const VerificationCode = sessionStorage.getItem(
          "emailVerificationCode"
        );

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/login`,
          {
            email: verifiedEmail,
            password: passwordInput.trim(),
            ...(VerificationCode && { verificationCode: VerificationCode }),
          }
        );

        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);

          const storedToken = localStorage.getItem("authToken");
          console.log("Token stored successfully:", storedToken);
          await checkAuthStatus();
        }

        sessionStorage.removeItem("emailVerificationCode");
        sessionStorage.removeItem("verifiedEmail");

        navigate("/");
      } catch (error) {
        if (error.message.includes("Email verification")) {
          alert(t("loginRegistration.sessionExpired"));
          navigate("/login");
        } else if (error.response?.data?.error === "invalidPassword") {
          setPasswordError(true);
          setPasswordErrorMessage(t("loginRegistration.invalidPassword"));
        } else {
          console.error("Login error:", error);
          alert(t("loginRegistration.generalError"));
        }
      }
    }
  };

  return (
    <div className="emailLogRegBox">
      <GoBackButton path="/email-check" />
      <h1 className="loginWelcome">
        {t("loginRegistration.loginWelcome")}&nbsp;{" "}
        <p className="loginWelcomeUsername">{username}</p>&nbsp;!
      </h1>
      <i className="fa-solid fa-circle-user"></i>
      <div className="loginTop">
        <div className="registerInputErrorBox">
          <div
            className={`emailLogRegInputBox ${passwordError ? "Error" : ""}`}
            onClick={handlePasswordDivClick}
          >
            <i className="fa-solid fa-lock"></i>
            <input
              className="emailLogRegInput"
              placeholder={t("loginRegistration.registerTitlePassword") + "..."}
              type={isPasswordVisible ? "text" : "password"}
              value={passwordInput}
              ref={passwordInputRef}
              onChange={handlePasswordChange}
              onKeyDown={handlePasswordKeyChange}
            />
            {isPasswordVisible ? (
              <i
                className="fa-solid fa-eye-slash"
                onClick={handlePasswordVisibility}
              ></i>
            ) : (
              <i
                className="fa-solid fa-eye"
                onClick={handlePasswordVisibility}
              ></i>
            )}
          </div>
          {passwordError && (
            <p className="emailLogRegErrorMessage">{passwordErrorMessage}</p>
          )}
        </div>
      </div>
      <div className="loginBottom">
        <div className={`emailLogRegCheckboxBox ${termsError ? "error" : ""}`}>
          <input
            type="checkbox"
            checked={isTermsAccepted}
            onChange={handleTermsAcceptance}
          />
          <p className="emailLogRegCheckbox">
            {t("loginRegistration.loginRememberMe")}
          </p>
        </div>
        <button className="emailLogRegContinue" onClick={handleLoginSubmit}>
          {t("loginRegistration.loginLogIn")}
        </button>
        <a className="loginForgotPassword">
          {t("loginRegistration.loginForgottenPassword")}
        </a>
      </div>
    </div>
  );
}
