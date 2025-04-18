import "./LoadingAnimation.css";
import { useTranslation } from "react-i18next"; 

const LoadingAnimation = () => {
const { t } = useTranslation();

  return (
    <div className="loadingScreen">
      <div className="loadingContent">
        <div className="spinnerContainer">
          <div className="spinnerArc spinnerArc1"></div>
          <div className="spinnerArc spinnerArc2"></div>
          <div className="spinnerArc spinnerArc3"></div>
          <div className="textBox">
            <h3>{t("app.loading")}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;