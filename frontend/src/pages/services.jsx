import { useState, useRef, useEffect } from "react";
import "./services.css";
import Comments from "../components/Comments.jsx";


export default function Services() {
 const services = [
   {title: "Personalized Meal Plans", description: `Get meal plans tailored to your dietary needs, lifestyle, and fitness goals. Our expert nutritionists craft customized meal plans that align with your preferences, whether you're looking to lose weight, build muscle, or simply eat healthier. Each plan includes balanced recipes, portion guidance, and nutritional breakdowns to help you stay on track and achieve sustainable results.`, icon: "fa-solid fa-utensils"},
   {title: "Workshops & Seminars", description: `Join interactive workshops on healthy eating, meal prep, and nutrition. Our expert-led sessions cover a variety of topics, including meal planning, understanding macronutrients, and mindful eating techniques. Whether you're a beginner or looking to deepen your knowledge, these engaging workshops provide practical tips and hands-on experience to help you build long-term healthy habits.`, icon: "fa-solid fa-chalkboard-user"},
   {title: "Weight Management Programs", description: `Achieve lasting weight control through personalized nutrition and fitness strategies. Our structured programs focus on creating sustainable habits by combining tailored meal plans, exercise recommendations, and behavioral coaching. We emphasize healthy weight loss without extreme dieting, ensuring that you maintain progress and feel your best in the long run.`, icon: "fa-solid fa-weight-scale"},
   {title: "Online Consultations", description: `Get expert nutrition guidance from home with virtual consultations. Whether you need help with meal planning, dietary restrictions, or weight management, our certified nutritionists provide one-on-one support through video calls. Our flexible online sessions make it easy to get personalized advice no matter where you are, helping you stay accountable and motivated on your health journey.`, icon: "fa-solid fa-user-nurse"},
 ];
 const servLocation = {
   name: "Varna Office",
   address: `LevskiPrimorski, st. "Studentska" 1, 9010 Varna`,
   phone: "+359 89 876 4348",
   workHours: [{hours:"Mon-Fri: 8 AM - 8 PM"},{hours:"Sat-Sun: 10 AM - 6 PM"}],
   mapUrl:`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2908.141318950937!2d27.9386521!3d43.2241237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a45580c8146d6b%3A0x887e796bb95a5497!2sProfessional%20High%20School%20of%20Computer%20Modeling%20and%20Systems%20%22Academic%20Blagovest%20Sendov%22!5e0!3m2!1sen!2sbg!4v1691234567890!5m2!1sen!2sbg`,
 };
 const servDelivery = {
  areas: ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora", "Pleven", "Sliven", "Dobrich", "Shumen"],
  terms: [{title: "Service Areas: ",description: "Delivery is available within the city limits of the listed areas. If you're unsure whether your location is covered, please contact our support team."},
  {title: "Order Placement: ", description: "Orders must be placed at least 24 hours in advance to ensure proper preparation and timely delivery."},
  {title: "Delivery Fees: ", description: "Fees vary depending on your location and order size. Exact charges will be calculated at checkout."},
  {title: "Free Delivery: ", description: "Enjoy free delivery on all orders over 100 BGN. Smaller orders may be subject to standard delivery fees."},
  {title: "Delivery Time Slots: ", description: "Deliveries are scheduled in specific time slots to ensure efficiency. You can select a preferred time when placing your order."},
  {title: "Order Tracking: ", description: "Track your order in real-time through our online system. You'll receive live updates and estimated arrival times."},
  {title: "Returns & Refunds: ", description: "If there is an issue with your order, please report it within 24 hours for a refund or replacement."},
  {title: "Special Requests: ", description: "We accommodate special requests such as dietary restrictions or specific delivery instructions. Let us know in advance!"}
  ],
};

 return (
   <div className="services">
{/*------------------------------HEADER----------------------------------*/}
     <div className="servHeader">
       <h1><strong>Services</strong></h1>
       <h3><strong>Discover how we can help you achieve your health and wellness goals.</strong></h3>
     </div>
{/*------------------------------SERVICES----------------------------------*/}
     <div className="servServices">
       {services.map((service, index) => (
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
        <h1><strong>Location</strong></h1>
        <h3><strong>Visit us at our Varna office or contact us for more information.</strong></h3>
      </div>
       <div className="servLocation">
         <h3 className="servServiceTitle"><strong>{servLocation.name}: </strong></h3>
         <p className="servLocationText"><strong>Address: </strong>{servLocation.address}</p>
         <p className="servLocationText"><strong>Phone: </strong>{servLocation.phone}</p>
         <p className="servLocationText"><strong>Work hours: </strong></p>
         {servLocation.workHours.map((item,index) => (
         <p className="servLocationText" key={index}>{item.hours}</p>
         ))}
         <iframe title={servLocation.name} src={servLocation.mapUrl} className="servMap" allowFullScreen="" loading="lazy"></iframe>
       </div>
     </div>
{/*------------------------------DELIVERY----------------------------------*/}
    <div className="servBox">
      <div className="servHeader">
        <h1><strong>Delivery Areas & Guidelines</strong></h1>
        <h3><strong>We deliver to the following areas:</strong></h3>
      </div>
      <div className="servDelivery">
        <ul className="servDeliveryAreas">
        {servDelivery.areas.map((area, index) => (
        <li className="servCities" key={index}>{area}</li>
        ))}
        </ul>
        <h3><strong>Our delivery terms and conditions: </strong></h3>
        <ul className="servDeliveryTerms">
        {servDelivery.terms.map((term, index) => (
        <li className="servTerms" key={index}><strong>{term.title}</strong>{term.description}</li>
        ))}
        </ul>
      </div>
    </div>
{/*------------------------------COMMENTS----------------------------------*/}
    <div className="servBox">
    <div className="servHeader">
        <h1><strong>Comments & Reviews</strong></h1>
        <h3><strong>Check what our clients are saying about our services or leave a comment yourself:</strong></h3>
      </div>
      <Comments/>
    </div>
    </div>
 );
}
