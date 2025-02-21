import { useState } from "react";
import "./services.css";

export default function Services() {
  const services = [
    {
      title: "Personalized Meal Plans",
      description: "Get meal plans tailored to your dietary needs, lifestyle, and fitness goals. Our expert nutritionists create customized plans to help you stay on track.",
      icon: "fa-solid fa-utensils",
    },
    {
      title: "Workshops & Seminars",
      description: "Join interactive workshops on healthy eating, meal prep, and nutrition. Learn practical tips to improve your diet and overall well-being.",
      icon: "fa-solid fa-chalkboard-user",
    },
    {
      title: "Weight Management Programs",
      description: "Achieve lasting weight control through personalized nutrition and fitness strategies. Our programs focus on sustainable habits, not extreme dieting.",
      icon: "fa-solid fa-weight-scale",
    },
    {
      title: "Online Consultations",
      description: "Get expert nutrition guidance from home with virtual consultations. Flexible and convenient, perfect for your busy lifestyle.",
      icon: "fa-solid fa-user-nurse",
    },
    {
      title: "Diabetes & Heart Health Programs",
      description: "Manage diabetes, heart health, and cholesterol with specialized nutrition plans. Take control of your health with expert support.",
      icon: "fa-solid fa-heart",
    },
  ];
  

  const location = {
    name: "Varna Office",
    address: "123 Sea Garden, Varna, Bulgaria",
    phone: "+359 123 456 789",
    workHours: [{hours:"Mon-Fri: 8 AM - 8 PM"},{hours:"Sat-Sun: 10 AM - 6 PM"}],
    mapUrl:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2908.141318950937!2d27.91484731548393!3d43.20490297913878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a453f608f1f3a9%3A0x3f5a3a3a3a3a3a3a!2sSea%20Garden%2C%20Varna%2C%20Bulgaria!5e0!3m2!1sen!2sbg!4v1691234567890!5m2!1sen!2sbg",
  };

  return (
    <div className="services">
      <div className="servicesHeader">
        <h1>Our Services</h1>
        <p>Discover how we can help you achieve your health and wellness goals.</p>
      </div>
      <div className="servicesList">
        {services.map((service, index) => (
          <div className="serviceCard" key={index}>
            <i className={service.icon}></i>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
      <div className="location">
        <h2>Our Location</h2>
        <p>Visit us at our Varna office or contact us for more information.</p>
        <div className="locationCard">
          <h3>{location.name}</h3>
          <p>{location.address}</p>
          <p>{location.phone}</p>
          <p>{location.hours}</p>
          <iframe
            title={location.name}
            src={location.mapUrl}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
      <div className="cta">
        <h2>Ready to Transform Your Health?</h2>
        <p>Book a consultation today or visit us at our Varna office.</p>
        <button>Book Now</button>
      </div>
    </div>
  );
}