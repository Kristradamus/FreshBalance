import { useState, useRef, useEffect } from "react";
import { useNavigate} from "react-router-dom";
import TermsAndConditions from "../components/TermsAndConditions.jsx"
import "./legalPage.css";

export default function legalPage(){
  return (
    <div className="termsAndConditionsBox">
      <TermsAndConditions/>
    </div>
  )
};