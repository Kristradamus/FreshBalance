import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
 const navigate = useNavigate();

 const { t } = useTranslation();
 const footerData = t("footer.footerData", {returnObject:true});

{/*-----------------------------------------------JS--------------------------------------------*/}
 const handleLogoClick = () => {
  if(location.pathname === "/"){
    window.location.reload();
  }
  else{
    navigate("/");
  }
}
 const handleFooterNavClick = (link) => {
  if(location.pathname === link){
    window.location.reload();
  }
  else{
    navigate(link);
  }
 };

 return (
  <div className="footer">
    {/*-----------------------------------------------FOOTER-TOP--------------------------------------------*/}
    <div className="footerTop">
      <div className="footerFirstColumn">
        <img src={footerData.brand.logo} alt="FreshBalance Logo" onClick={handleLogoClick}/>
        <h3>{footerData.brand.name}</h3>
        <p>{footerData.brand.description}</p>
      </div>
      <div className="footerMiddleColumn">
        <div className="footerSecondColumn">
          <h3>{footerData.browse.title}</h3>
          <ul className="footerNav">
            {footerData.browse.links.map((item, index) => (
              <li key={index} className="footerNavElement">
                <Link to={item.link} className="footerLink" onClick={() => handleFooterNavClick(item.link)}>
                  <p>{item.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footerThirdColumn">
          <h3>{footerData.services.title}</h3>
          <ul className="footerServices">
            {footerData.services.items.map((item, index) => (
              <li key={index} className="footerService"><p>{item.text}</p></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footerFourthColumn">
        <div className="footerContactsBox">
          <h3>{footerData.contacts.title}</h3>
          <ul className="footerContacts">
            {footerData.contacts.items.map((item, index) => (
              <li key={index} className="footerContact">
                <i className={item.icon}></i><p className="footerContactText">{item.text}</p> 
              </li>
            ))}
          </ul>
        </div>
        <div className="footerSocialMediaBox">
          <h3>{footerData.socialMedia.title}</h3>
          <ul className="footerSocialMedia">
            {footerData.socialMedia.items.map((item, index) => (
              <li key={index} onClick={() => (window.location.href = item.link)}>
                <a href={item.link}>
                  <i className={item.icon}></i>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    {/*-----------------------------------------------FOOTER-BOTTOM--------------------------------------------*/}
    <hr></hr>
    <div className="footerBottom">
      <p className="footerCopyright"><i className="fa-regular fa-copyright"></i>{t("footer.copyright")}&nbsp;</p>
      <p className="footerCreator">{t("footer.createdBy")}&nbsp;<a href="https://github.com/Kristradamus"><strong>{t("footer.creator")}</strong></a></p>
    </div>
  </div>
  );
}