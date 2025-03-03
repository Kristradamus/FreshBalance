import { useState, useRef, useEffect } from "react";
import "./loginRegistration.css";
import logo from "../images/freshBalance.png";
import { Link } from 'react-router-dom';

export default function LoginRegistration() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [hasError, setHasError] = useState("");

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
      setEmailError("Please, enter a valid email address!");
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
          <h1><strong>Hello!</strong></h1>
          <p className="emailPls">Please enter your email address</p>
          <div className={`emailInputBox ${hasError ? "Error" : ""}`}>
            <input className="emailInput" placeholder="Email..."value={email} onChange={handleEmailChange}/>
          </div>
          {emailError && <p className="emailErrorMessage">{emailError}</p>}
          <button className="emailContinue" onClick={handleContinue}><strong>Continue</strong></button>
          <p className="emailDontWorry">You don't have an account? Don't worry, just input the email with which you want to create one.</p>
        </div>
        <div className="emailDivider">
          <hr/>
          <p>or</p>
          <hr/>
        </div>
        <div className="emailBottom">
          <p className="emailAlso">You can also login with:</p>
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
      <Link className="loginRegisterNeedHelp" to="/support"><p><strong>Need help?</strong></p></Link>
    </div>
  );
}
