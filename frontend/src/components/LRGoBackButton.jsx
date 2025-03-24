import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./LRGoBackButton.css";

export default function GoBackButton({path}){
const { t } = useTranslation();
const navigate = useNavigate();

return (
    <button className="logRegGoBackButton" onClick={() => navigate(path)}>{t("loginRegistration.loginRegisterGoBack")}</button>
);};