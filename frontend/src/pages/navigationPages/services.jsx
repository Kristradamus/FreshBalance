import { useTranslation } from "react-i18next";
import Comments from "../../components/reusableComponents/Comments.jsx";
import "./services.css";

export default function Services() {
const { t } = useTranslation();
const servicesData = t("services.servicesData", {returnObject:true});
  
return (
  <div className="services">

    {/*------------------------------HEADER----------------------------------*/}
    <div className="servHeader">
      <h1>{servicesData.paragraphs.services.title}</h1>
      <h3>{servicesData.paragraphs.services.subTitle}</h3>
    </div>

    {/*------------------------------SERVICES----------------------------------*/}
    <div className="servServices">
      {servicesData.services.map((service, index) => (
        <div className="servService" key={index}>
          <i className={service.icon}></i>
          <h3 className="servServiceTitle">{service.title}</h3>
          <p className="servServiceDescription">{service.description}</p>
        </div>
      ))}
    </div>

    {/*------------------------------LOCATION----------------------------------*/}
    <div className="servBox">
      <div className="servHeader">
        <h1>{servicesData.paragraphs.location.title}</h1>
        <h3>{servicesData.paragraphs.location.subTitle}</h3>
      </div>
      <div className="servLocation">
        <h3 className="servServiceTitle">{servicesData.location.name}: </h3>
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
        <h1>{servicesData.paragraphs.delivery.title}</h1>
        <h3>{servicesData.paragraphs.delivery.subTitle}</h3>
      </div>
      <div className="servDelivery">
        <ul className="servDeliveryAreas">
          {servicesData.delivery.areas.map((area, index) => (
            <li className="servCities" key={index}><p>{area}</p></li>
          ))}
        </ul>
        <h3>{servicesData.delivery.subTitle1}</h3>
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
        <h1>{servicesData.paragraphs.comments.title}</h1>
        <h3>{servicesData.paragraphs.comments.subTitle}</h3>
      </div>
      <Comments/>
    </div>
  </div>
)};
