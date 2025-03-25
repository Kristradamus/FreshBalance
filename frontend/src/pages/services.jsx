import { useTranslation } from "react-i18next";
import Comments from "../components/Comments.jsx";
import "./services.css";

export default function Services() {
const { t } = useTranslation();
const servicesData = t("services.servicesData", {returnObject:true});
  
return (
  <div className="services">

    {/*------------------------------HEADER----------------------------------*/}
    <div className="servHeader">
      <h1><strong>{servicesData.paragraphs.services.title}</strong></h1>
      <h3><strong>{servicesData.paragraphs.services.subTitle}</strong></h3>
    </div>

    {/*------------------------------SERVICES----------------------------------*/}
    <div className="servServices">
      {servicesData.services.map((service, index) => (
        <div className="servService" key={index}>
          <i className={service.icon}></i>
          <h3 className="servServiceTitle"><strong>{service.title}</strong></h3>
          <p className="servServiceDescription">{service.description}</p>
        </div>
      ))}
    </div>

    {/*------------------------------LOCATION----------------------------------*/}
    <div className="servBox">
    <div className="servHeader">
      <h1><strong>{servicesData.paragraphs.location.title}</strong></h1>
      <h3><strong>{servicesData.paragraphs.location.subTitle}</strong></h3>
    </div>
      <div className="servLocation">
        <h3 className="servServiceTitle"><strong>{servicesData.location.name}: </strong></h3>
        <p className="servLocationText"><strong>{servicesData.location.address.addressTitle}</strong>{servicesData.location.address.addressDescription}</p>
        <p className="servLocationText"><strong>{servicesData.location.phone.phoneTitle}</strong>{servicesData.location.phone.phoneDescription}</p>
        <p className="servLocationText"><strong>{servicesData.location.workHours.workHoursTitle}</strong></p>
        {servicesData.location.workHours.workHoursDescription.map((item,index) => (
        <p className="servLocationText" key={index}>{item.hours}</p>
        ))}
        <iframe title={servicesData.location.name} src={servicesData.location.mapUrl} className="servMap" allowFullScreen="" loading="lazy"></iframe>
      </div>
    </div>

    {/*------------------------------DELIVERY----------------------------------*/}
    <div className="servBox">
      <div className="servHeader">
        <h1><strong>{servicesData.paragraphs.delivery.title}</strong></h1>
        <h3><strong>{servicesData.paragraphs.delivery.subTitle}</strong></h3>
      </div>
      <div className="servDelivery">
        <ul className="servDeliveryAreas">
        {servicesData.delivery.areas.map((area, index) => (
        <li className="servCities" key={index}><p>{area}</p></li>
        ))}
        </ul>
        <h3><strong>{servicesData.delivery.subTitle1}</strong></h3>
        <ul className="servDeliveryTerms">
        {servicesData.delivery.terms.map((term, index) => (
        <li className="servTerms" key={index}><p><strong>{term.title} </strong>{term.description}</p></li>
        ))}
        </ul>
      </div>
    </div>
    
    {/*------------------------------COMMENTS----------------------------------*/}
    <div className="servBox">
      <div className="servHeader">
        <h1><strong>{servicesData.paragraphs.comments.title}</strong></h1>
        <h3><strong>{servicesData.paragraphs.comments.subTitle}</strong></h3>
      </div>
      <Comments/>
    </div>
  </div>
)};
