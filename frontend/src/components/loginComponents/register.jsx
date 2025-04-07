import { useState, useRef, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";
import axios from "axios";
import { z } from "zod";
import GoBackButton from "../reusableComponents/LRGoBackButton";

export default function Register({email, setIsTermsVisible, userProgress, setUserProgress}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkAuthStatus } = useContext(AuthContext);
  const [registerFormData, setRegisterFormData] = useState(() => {
    return userProgress.registerFormDataMain || {
      username: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false
    };
  });

  // PASSWORD STATES
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  // USERNAME STATES
  const [usernameError, setUsernameError] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");

  // TERMS STATES
  const [termsError, setTermsError] = useState(false);
  const [termsErrorMessage, setTermsErrorMessage] = useState("");

  // REFS
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  /*------------------------------------INPUT-CUSTOMIZATIONS------------------------------------*/
  useEffect(() => {
    setUserProgress(prevProgress => ({
      ...prevProgress,
      registerFormDataMain: registerFormData
    }));
  }, [registerFormData, setUserProgress]);

  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  const handleUsernameChange = (e) => {
    setRegisterFormData({...registerFormData, username: e.target.value});
    setUsernameError(false);
  };

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
    setRegisterFormData({...registerFormData, password: e.target.value});
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
      confirmPasswordInputRef.current.focus();
    }
  };

  const handlePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // CONFIRM PASSWORD
  const handleConfirmPasswordChange = (e) => {
    setRegisterFormData({...registerFormData, confirmPassword: e.target.value});
    setPasswordError(false);
  };

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
    setRegisterFormData({...registerFormData, termsAccepted: e.target.checked});
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
      if (registerFormData.username.trim().length > 0) {
        try {
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/username-check`,
            {username: registerFormData.username.trim(),}
          );
          if (!response.data.exists) {
            setUsernameAvailable(true);
            setUsernameError(false);
          } 
          else {
            setUsernameAvailable(false);
            setUsernameError(true);
            setUsernameErrorMessage(t("loginRegistration.registration.usernameTaken"));
          }
        } 
        catch (error) {
          console.error("Username check failed:", error);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [registerFormData.username, t]);

  /*------------------------------------ZOD-VALIDATION-SCHEMA------------------------------------*/
  const RegistrationSchema = z
    .object({
      username: z
        .string()
        .max(30, { message: t("loginRegistration.registration.username30Chars") })
        .min(3, { message: t("loginRegistration.registration.username3Chars") })
        .regex(/^[a-zA-Z0-9_]+$/, {
          message: t("loginRegistration.registration.usernameAllowedCharacters"),
        })
        .min(1, { message: t("loginRegistration.registration.usernameRequired") })
        .trim(),
      confirmPassword: z
        .string()
        .min(1, { message: t("loginRegistration.registration.confirmPassword") })
        .trim(),
      password: z
        .string()
        .regex(/[A-Z]/, {
          message: t("loginRegistration.registration.passwordUpperCaseLetter"),
        })
        .regex(/[0-9]/, {
          message: t("loginRegistration.registration.password1Number"),
        })
        .min(8, { message: t("loginRegistration.registration.password8Chars") })
        .min(1, { message: t("loginRegistration.registration.passwordRequired") })
        .trim(),
      termsAccepted: z.literal(true, {
        errorMap: () => ({
          message: t("loginRegistration.registration.termsRequired"),
        }),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("loginRegistration.registration.passwordsDoNotMatch"),
      path: ["confirmPassword"],
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
      setUsernameErrorMessage(t("loginRegistration.registration.usernameTaken"));
      isValid = false;
    }

    if (isValid) {
      try {
        const validatedData = await RegistrationSchema.parseAsync({
          username: registerFormData.username,
          password: registerFormData.password,
          confirmPassword: registerFormData.confirmPassword,
          termsAccepted: registerFormData.termsAccepted,
        });
        try {

          const verifiedEmail = sessionStorage.getItem("verifiedEmail");
          const verificationCode = sessionStorage.getItem("emailVerificationCode");

          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/register`,{
            email: verifiedEmail,
            verificationCode: verificationCode,
            username: validatedData.username,
            password: validatedData.password,
          },
          {
            validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 401,
          });

          console.log("Registration response:", response);
          if (response.status === 201) {
            sessionStorage.removeItem("emailVerificationCode");
            sessionStorage.removeItem("verifiedEmail");
            if (response.data.token) {
              const lastPublicPage = sessionStorage.getItem("lastPublicPage") || "/";
              navigate(lastPublicPage, {
                state: {
                  showToast: true,
                  toastMessage: t("loginRegistration.registration.success")
                }
              });
              
              localStorage.setItem("authToken", response.data.token);
              console.log("Token stored successfully!");
              await checkAuthStatus();
            }
          }
        } 
        catch (error) {
          const errorMessage = t("loginRegistration.registration.failed");
          alert(errorMessage);
          console.error("Registration failed:", error.response?.data?.message);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            switch (err.path[0]) {
              case "username":
                setUsernameError(true);
                setUsernameErrorMessage(err.message);
                break;
              case "password":
              case "confirmPassword":
                setPasswordError(true);
                setPasswordErrorMessage(err.message);
                break;
              case "termsAccepted":
                setTermsError(true);
                setTermsErrorMessage(err.message);
                break;
            }
          });
        }
      }
    }
  };
  return (
    <div className="emailLogRegBox">
      <GoBackButton path="/email-check" />
      <div className="registerWelcomeBox">
        <h1 className="registerWelcome">{t("loginRegistration.registration.welcome")}</h1>
        <p className="registerEmail">{email}</p>
      </div>
      <div className="registerTop">
        <div className="registerInputErrorBox">
          <div className={`emailLogRegInputBox ${usernameError ? "Error" : ""}`} onClick={handleUsernameDivClick}>
            <i className="fa-solid fa-user"></i>
            <input className="emailLogRegInput" placeholder={t("loginRegistration.registration.titleUsername") + "..."} value={registerFormData.username} ref={usernameInputRef} onChange={handleUsernameChange} onKeyDown={handleUsernameKeyChange}/>
          </div>
          {usernameError && (<p className="emailLogRegErrorMessage">{usernameErrorMessage}</p>)}
        </div>
        <div className="registerInputErrorBox">
          <div className={`emailLogRegInputBox ${passwordError ? "Error" : ""}`} onClick={handlePasswordDivClick} >
            <i className="fa-solid fa-lock"></i>
            <input className="emailLogRegInput" placeholder={t("loginRegistration.registration.titlePassword") + "..."} type={isPasswordVisible ? "text" : "password"} value={registerFormData.password} ref={passwordInputRef} onChange={handlePasswordChange} onKeyDown={handlePasswordKeyChange}/>
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
            <input className="emailLogRegInput" placeholder={t("loginRegistration.registration.titleConfirmPassword") + "..." } type={isConfirmPasswordVisible ? "text" : "password"} value={registerFormData.confirmPassword} ref={confirmPasswordInputRef} onChange={handleConfirmPasswordChange} onKeyDown={handleConfirmPasswordKeyChange}/>
            {isConfirmPasswordVisible ? (
              <i className="fa-solid fa-eye-slash" onClick={handleConfirmPasswordVisibility}></i>
            ) : (
              <i className="fa-solid fa-eye" onClick={handleConfirmPasswordVisibility}></i>
            )}
          </div>
          {passwordError && (
            <p className="emailLogRegErrorMessage">{passwordErrorMessage}</p>
          )}
        </div>
      </div>
      <div className="registerBottom">
        <div className="registerInputErrorBox">
          <div className={`emailLogRegCheckboxBox ${termsError ? "error" : ""}`}>
            <input type="checkbox" checked={registerFormData.termsAccepted} onChange={handleTermsAcceptance}/>
            <p className="emailLogRegCheckbox">
              {t("loginRegistration.registration.terms")}&nbsp;
              <a className="emailLogRegCheckboxLink" onClick={handleTermsVisibility}><strong>{t("loginRegistration.registration.legalPolicies")}</strong></a>
            </p>
          </div>
          {termsError && (<p className="emailLogRegErrorMessage">{termsErrorMessage}</p>)}
        </div>
        <button className="emailLogRegContinue" onClick={handleRegistrationSubmit}>{t("loginRegistration.registration.continue")}</button>
      </div>
    </div>
  );
};