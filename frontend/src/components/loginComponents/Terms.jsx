import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LegalPolicies from "../reusableComponents/LegalPolicies";

const Terms = ({ setIsTermsVisible }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate("/email-check/register"); 
    setIsTermsVisible(false);
  };
  
  return (
    <div className="termsPageBox">
      <button className="termsGoBackButton" onClick={handleGoBack}>{t("loginRegistration.goBack")}</button>
      <LegalPolicies />
    </div>
  );
};

export default Terms;