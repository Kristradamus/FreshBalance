import React, { useState, useEffect } from "react";
import "./aboutUs.css";

function subSection({photo, subTitle, subText}) => {
  return photo ? (
    <div className="aboutUsPhotoContainer"></div>
  )
}
export default function AboutUs() {
  const aboutUsData = [
    {title:"Our Brand Story",text:`FreshBalance was founded out of a personal journey. As a fitness enthusiast 
      and nutrition advocate, our founder Kristiyan Krustev experienced firsthand the challenges of finding high-quality. 
      trustworthy nutrition products that delivered real results. Frustrated by the lack of transparency and effectiveness 
      in the market, Kristiyan Krustev decided to take matters into their own hands. What started as a mission to create a 
      better solution for themselves soon grew into a vision to help others. FreshBalance was born to fill the gap in the market.
      FreshBalance is a brand that prioritizes quality, science, and customer trust above all else. Every product we offer is a 
      reflection of our commitment to helping you live a healthier, more balanced life.`},

    {title:"Who We Serve",text:`At FreshBalance, we cater to everyone who values their health and wellness. Whether you are a 
      professional athlete, a busy parent, a fitness newbie, or someone simply looking to improve your daily nutrition, we’ve got 
      something for you. We understand that no two journeys are the same, which is why we offer a diverse range of products to meet 
      your unique needs. Our goal is to empower you to take control of your health and achieve your goals with confidence.`,
      points:"Our product line includes:",
      subPoints:[
        {subTitle:"Proteins",subText:`To support muscle recovery and growth.`}, 
        {subTitle:"Amino Acids", subText:`To enhance performance and endurance.`},
        {subTitle:"Vitamins", subText:`To fill nutritional gaps and boost overall health.`},
        {subTitle:"Minerals", subText:`To support essential bodily functions and overall well-being.`},
        {subTitle:"Performance Enhancers", subText:`To optimize physical and mental performance during workouts and daily activities.`},
        {subTitle:"Cosmetics", subText:`Skincare and beauty products infused with natural, nourishing ingredients to enhance your outer glow.`},
        {subTitle:"Bio Products", subText:`Organic and eco-friendly products designed to promote a sustainable and healthy lifestyle.`},
        {subTitle:"Weight Management", subText:`Supplements and meal replacements designed to support healthy weight loss, metabolism, and appetite control.`}]
    },

    {title:"How We Operate", text:`Transparency and quality are at the heart of everything we do. All FreshBalance products are 
      crafted using scientifically backed formulas and ethically sourced ingredients. We work closely with trusted manufacturers 
      to ensure every product meets our strict standards for purity, potency, and effectiveness. What sets us apart is our commitment 
      to education and customer care. We don’t just sell products—we provide resources, guidance, and support to help you make informed 
      decisions about your nutrition.`},

    {title:"The Face of FreshBalance", text:`We’re proud to share our journey with you, and we’d love for you to get to know us better. 
      FreshBalance is a small but passionate team dedicated to making a big impact.`,
      points:"Meet the people who make it all happen:",
      subPoints:[
        { photo: "", subTitle: "Kristiyan Krustev", subText: "Founder & Nutrition Enthusiast" },
        { photo: "", subTitle: "Kristiyan Krustev", subText: "Head of Product Development" },
        { photo: "", subTitle: "Kristiyan Krustev", subText: "Frontend Developer" },
        { photo: "", subTitle: "Kristiyan Krustev", subText: "Backend Developer" },
        { photo: "", subTitle: "Kristiyan Krustev", subText: "UI/UX Designer" },
        { photo: "", subTitle: "Kristiyan Krustev", subText: "Project Manager" },
        { photo: "", subTitle: "Kristiyan Krustev", subText: "DevOps Engineer" },
        { photo: "", subTitle: "Kristiyan Krustev", subText: "SEO & Content Writer" },
        { photo: "", subTitle: "Kristiyan Krustev", subText: "QA Tester" }],
    }]
  return(
    <div className="aboutUs">
      <div className="aboutUsBox">
        <div className="aboutUsInsideBox">
          <div>
          <p className="aboutUsText">Welcome to FreshBalance, your trusted partner in achieving optimal health and wellness through premium nutrition. 
            Our story is one of passion, dedication, and a deep belief in the transformative power of proper nutrition. 
            Let us take you on a journey through who we are, what we stand for, and why we are here to serve you.
          </p>
          <hr></hr>
          </div>
          {aboutUsData.map((section, index) => (
            <ul className="mainAboutUs" key={index}>
            <h2 className="aboutUsTitle">{section.title}</h2>
            <p className="aboutUsInsideText">{section.text}</p>
            {section.points && <h4 className="aboutUsSubTitle">{section.points}</h4>}
            {section.subPoints && (
              <ul>
                {section.subPoints.map((subSection, subIndex) => (
                <li key={subIndex} className="aboutUsSubPoints">
                  {subSection.photo && <img className="teamPhoto" src={subSection.photo} alt={subSection.subTitle} />}
                  {!subSection.photo && <i className="fa-solid fa-check"></i>}
                  <strong>{subSection.subTitle}: </strong>{subSection.subText}
                </li>
                ))}
              </ul>
              )}
            </ul>
          ))}
          <div>
            <hr></hr>
            <p className="aboutUsText">This About Us page combines your brand story, mission, and values with a personal touch, while also guiding customers 
              toward the next steps. It’s designed to build trust, create connection, and inspire action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}