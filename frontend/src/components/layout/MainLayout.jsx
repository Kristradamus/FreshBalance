import Header from "./Header.jsx";
import Navigation from "./Navigation.jsx";
import Footer from "./Footer.jsx";
import ConfirmationToast from "../reusableComponents/ConfirmationToast.jsx";
import "./MainLayout.css";
import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function MainLayout() {
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (location.state?.showToast) {
      setShowToast(true);
      setToastMessage(location.state.toastMessage);
      
      window.history.replaceState({}, '');
    }
  }, [location.state]);

return (
  <div className="layout">
    <Header />
    <Navigation/>
    <div className="mainLayout">
      <Outlet />
    </div>
    <Footer />
    <ConfirmationToast show={showToast} message={toastMessage} onClose={() => setShowToast(false)}/>
  </div>
);};