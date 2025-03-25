import { useTranslation } from "react-i18next";
import "./aboutUs.css";

export default function AboutUs() {
const { t } = useTranslation();
const aboutUsData = t("aboutUs.aboutUsData", {returnObject: true});

const SubSection = ({ photo, subTitle, subText }) => {
  return photo ? (
    <div className="aboutUsPhotoContainer">
      <img className="aboutUsTeamPhoto" src={photo}/>
      <p><strong>{t("aboutUs.developer")}</strong></p>
      <hr />
      <p>{subText}</p>
    </div>
  ) : (
    <div className="aboutUsTextContainer">
      <i className="fa-solid fa-check"></i>
      <p><strong>{subTitle}: </strong> {subText}</p>
    </div>
  );
 };
return(
  <div className="aboutUs">
    <div className="aboutUsBox">
      <div className="aboutUsInsideBox">
        <div>
          <p className="aboutUsText">{t("aboutUs.starter")}</p>
          <hr></hr>
        </div>
        {aboutUsData.map((section, index) => (
          <ul className="aboutUsMain" key={index}>
            <h1 className="aboutUsTitle">{section.title}</h1>
            <p className="aboutUsInsideText">{section.text}</p>
            {section.points && <h3 className="aboutUsSubTitle">{section.points}</h3>}
            {section.subPoints && (
              <ul className={`aboutUsSubPointsBox ${section.subPoints.some(subSection => subSection.photo) ? "withPhoto" : ""}`}>
                {section.subPoints.map((subSection, subIndex) => (
                  <li key={subIndex} className={`aboutUsSubPoints ${subSection.photo ? "withPhoto" : ""}`}>
                    <SubSection {...subSection} />
                  </li>
                ))}
              </ul>
            )}
          </ul>
        ))}
        <div>
          <hr></hr>
          <p className="aboutUsText">{t("aboutUs.finisher")}</p>
        </div>
      </div>
    </div>
  </div>
);};