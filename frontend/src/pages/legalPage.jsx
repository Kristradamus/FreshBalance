import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TermsAndConditions from "../components/LegalPolicies.jsx";
import "./legalPage.css";

export default function legalPage() {
  return (
    <div className="legalPage">
      <TermsAndConditions />
    </div>
  );
}
