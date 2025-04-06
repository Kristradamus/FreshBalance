import { useEffect, useState, useRef } from 'react';
import './ConfirmationToast.css';

const ConfirmationToast = ({ message, show, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if(timerRef.current){
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  const startTimer = () =>{
    clearTimer();
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3500);
  }

  useEffect(() => {
    if(show){
      setIsVisible(true);
      startTimer();
    }
    else{
      setIsVisible(false);
      clearTimer();
    }
    return () => clearTimeout();
  }, [show, onClose])

  const handleToastClose = () =>{
    clearTimer();
    setIsVisible(false);
    onClose();
  }

  return (
    <div className={`confirmationToast ${isVisible ? 'show' : ''}`}>
      <div className="toastContent">
        <i className="fa-solid fa-circle-check"></i>
        <span className="toastMessage">{message}</span>
        <i className="fa-solid fa-xmark" onClick={handleToastClose}></i>
      </div>
    </div>
  );
};

export default ConfirmationToast;