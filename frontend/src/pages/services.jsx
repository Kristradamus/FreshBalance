import { useState, useRef, useEffect } from "react";
import "./services.css";
import Comments from "../components/Comments.jsx";


export default function Services() {
 const services = [
   {title: "Personalized Meal Plans", description: `Get meal plans tailored to your dietary needs, lifestyle, and fitness goals.
   Our expert nutritionists create customized plans to help you stay on track.`, icon: "fa-solid fa-utensils"},
   {title: "Workshops & Seminars", description: `Join interactive workshops on healthy eating, meal prep, and nutrition.
   Learn practical tips to improve your diet and overall well-being.`, icon: "fa-solid fa-chalkboard-user"},
   {title: "Weight Management Programs", description: `Achieve lasting weight control through personalized nutrition and fitness strategies.
   Our programs focus on sustainable habits, not extreme dieting.`, icon: "fa-solid fa-weight-scale"},
   {title: "Online Consultations", description: `Get expert nutrition guidance from home with virtual consultations.
   Flexible and convenient, perfect for your busy lifestyle.`, icon: "fa-solid fa-user-nurse"},
 ];
 const servLocation = {
   name: "Varna Office",
   address: `LevskiPrimorski, st. "Studentska" 1, 9010 Varna`,
   phone: "+359 89 876 4348",
   workHours: [{hours:"Mon-Fri: 8 AM - 8 PM"},{hours:"Sat-Sun: 10 AM - 6 PM"}],
   mapUrl:`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2908.141318950937!2d27.9386521!3d43.2241237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a45580c8146d6b%3A0x887e796bb95a5497!2sProfessional%20High%20School%20of%20Computer%20Modeling%20and%20Systems%20%22Academic%20Blagovest%20Sendov%22!5e0!3m2!1sen!2sbg!4v1691234567890!5m2!1sen!2sbg`,
 };
 const servDelivery = {
  areas: ["Varna", "Sofia", "Plovdiv", "Burgas", "Ruse", "Stara Zagora"],
  terms: [
    "Delivery is available within the city limits of the listed areas.",
    "Orders must be placed at least 24 hours in advance.",
    "Delivery fees vary based on location and order size.",
    "We offer contactless delivery for your safety.",
    "Free delivery for orders over 100 BGN.",
  ],
};

 return (
   <div className="services">
{/*------------------------------HEADER----------------------------------*/}
     <div className="servHeader">
       <h1><strong>Our Services</strong></h1>
       <p>Discover how we can help you achieve your health and wellness goals.</p>
     </div>
{/*------------------------------SERVICES----------------------------------*/}
     <div className="servServices">
       {services.map((service, index) => (
         <div className="servService" key={index}>
           <i className={service.icon}></i>
           <h2 className="servServiceTitle"><strong>{service.title}</strong></h2>
           <p className="servServiceDescription">{service.description}</p>
         </div>
       ))}
     </div>
{/*------------------------------LOCATION----------------------------------*/}
     <div className="servLocation">
       <h2><strong>Our Location</strong></h2>
       <p>Visit us at our Varna office or contact us for more information.</p>
       <div className="servLocationCard">
         <h3>{servLocation.name}</h3>
         <p className="servText">{servLocation.address}</p>
         <p className="servText">{servLocation.phone}</p>
         <p className="servText">{servLocation.hours}</p>
         <iframe title={servLocation.name} src={servLocation.mapUrl}
           width="100%"
           height="300"
           style={{ border: 0 }}
           allowFullScreen=""
           loading="lazy"
         ></iframe>
       </div>
     </div>
{/*------------------------------DELIVERY----------------------------------*/}
    <div className="servDelivery">
      <h2>
        <strong>Delivery Terms and Conditions</strong>
      </h2>
      <p>We deliver to the following areas:</p>
      <ul className="servDeliveryAreas">
        {servDelivery.areas.map((area, index) => (
        <li key={index}>{area}</li>
        ))}
      </ul>
      <p>Our delivery terms and conditions:</p>
      <ul className="servDeliveryTerms">
        {servDelivery.terms.map((term, index) => (
        <li key={index}>{term}</li>
        ))}
      </ul>
    </div>
{/*------------------------------COMMENTS----------------------------------*/}
    <div className="servComments">
      <Comments/>
    </div>
    </div>
 );
}
