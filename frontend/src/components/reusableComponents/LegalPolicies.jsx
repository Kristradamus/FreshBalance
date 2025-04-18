import { useTranslation } from "react-i18next";
import "./LegalPolicies.css";

const LegalPolicies = () => {
  const {t} = useTranslation();
  const legalPoliciesData = t("legalPolicies.data", {returnObject:true});
  
  return (
    <div className="legalPoliciesBox">
      {legalPoliciesData.map((policy, index) => (
        <div key={index} className="legalPoliciesThemeBox">
          <div className="legalPoliciesTitleBox">
            <h1 className="legalPoliciesTitle">{policy.title}</h1>
            <p className="legalPoliciesText">{policy.beginning}</p>
          </div>
          {policy.mainPoints.map((point, idx) => (
            <div key={idx} className="legalPoliciesTextBox">
              <h2 className="legalPoliciesSubTitle">{point.heading}</h2>
              <p className="legalPoliciesSubText">{point.content}</p>
              {point.subPoints && (
                <ul className="legalPoliciesSubPointsBox">
                  {point.subPoints.map((subPoint, subIdx) => (
                    <li key={subIdx} className="legalPoliciesSubPoints">{subPoint}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LegalPolicies;