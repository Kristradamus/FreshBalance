import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../../../public/images/freshBalance.png";
import EmailCheck from "../../components/loginComponents/EmailCheck.jsx";
import Login from "../../components/loginComponents/Login.jsx";
import Register from "../../components/loginComponents/Register.jsx";
import Terms from "../../components/loginComponents/Terms.jsx";
import { useTranslation } from "react-i18next";
import "./loginRegistration.css";

const LoginRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const currentStep = location.pathname.split("/").pop();
  const [userProgress, setUserProgress] = useState({
    emailChecked: false, 
    emailVerified: false, 
    termsViewed: false,
    registerFormDataMain: {
      username: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false
    },
    loginFormDataMain: {
      password: "",
      rememberMe: false
    }
  });
  
  // STATE VARIABLES SHARED ACROSS COMPONENTS
  const [email, setEmail] = useState("");
  const [displayEmail, setDisplayEmail] = useState("");
  const [emailCheckComplete, setEmailCheckComplete] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [username, setUsername] = useState("");
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  
  /*-----------------------------------------SMALL-JS--------------------------------------------------*/
  /*RELOAD AND LEAVE SITE PREVENTER*/
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
  
  /*BLOCKS THE USER FROM SKIPPING THE EMAIL CHECK*/
  useEffect(() => {
    if(currentStep === "login" || currentStep === "register" || currentStep === "terms"){
      if (!userProgress.emailChecked) {
        navigate("/email-check");
      }
    }
  }, [currentStep, userProgress.emailChecked, navigate]);
  
  /*CHECKS ON WHICH STEP IS THE USER*/
  useEffect(() => {
    if (currentStep === "login") {
      setEmailCheckComplete(true);
      setEmailExists(true);
    } 
    else if (currentStep === "register") {
      setEmailCheckComplete(true);
      setEmailExists(false);
      setIsTermsVisible(false);
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
  
  const resetFormData = () => {
    setUserProgress({
      emailChecked: false, 
      emailVerified: false, 
      termsViewed: false,
      registerFormDataMain: {
        username: "",
        password: "",
        confirmPassword: "",
        termsAccepted: false
      },
      loginFormDataMain: {
        password: "",
        rememberMe: false
      }
    });
  };
  
  return (
    <div className="loginRegister">
      <Link to="/">
        <img className="loginRegisterLogo" src={logo} alt="Fresh Balance" />
      </Link>
      {!emailCheckComplete && (<EmailCheck email={email} setEmail={setEmail} displayEmail={displayEmail} setDisplayEmail={setDisplayEmail} setEmailCheckComplete={setEmailCheckComplete}setEmailExists={setEmailExists} userProgress={userProgress} setUserProgress={setUserProgress}resetFormData={resetFormData}setUsername={setUsername}/>)}
      {emailCheckComplete && emailExists && currentStep === "login" && (<Login email={email} username={username} userProgress={userProgress} setUserProgress={setUserProgress}/>)}
      {emailCheckComplete && !emailExists && (currentStep === "register" || currentStep === "terms") && !isTermsVisible && (<Register email={email} setIsTermsVisible={setIsTermsVisible} userProgress={userProgress} setUserProgress={setUserProgress}/>)}
      {emailCheckComplete && !emailExists && currentStep === "terms" && isTermsVisible && (<Terms setIsTermsVisible={setIsTermsVisible}/>)}
      <Link className="loginRegisterNeedHelp" to="/support">
        <p><strong>{t("loginRegistration.needHelp")}</strong></p>
      </Link>
    </div>
  );
};

export default LoginRegistration;