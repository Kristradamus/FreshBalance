import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import "./support.css";
const baseApi = import.meta.env.VITE_BASE_API;

export default function Support() {
  const [selected, setSelected] = useState({ title: "", content: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const searchBoxRef = useRef(null);

  const { t } = useTranslation();
  const supportData = t("support.supportData", {returnObject:true});

{/*--------------------------------------FILTERING--------------------------------------*/}
  const filteredData = Object.keys(supportData).reduce((info, category) => {
    const filteredTopics = supportData[category].filter((item) =>
    item.issue.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filteredTopics.length > 0) {
      info[category] = filteredTopics;
    }
    return info;
  }, {});

  const handleContentChange = (issue, solution) => {
    setSelected({ title: issue, content: solution });
    setShowContactForm(false);
  };

  const handleBack = () => {
    setSelected({ title: "", content: "" });
    setShowContactForm(false);
  };

{/*--------------------------------------SEARCH-BAR--------------------------------------*/}
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

{/*----------------------------------EMAIL-SENDING-------------------------------------*/}
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message")
    };

    console.log("Submitting form data:", data);
    try {
      const response = await fetch(/*'http://localhost:5000/send-message'*/`https://nutritionwebsite2-0.onrender.com/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);
      if (response.ok) {
        alert(t("support.messageSent"));
        setShowContactForm(false);
      } 
      else{
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert(t("support.messageFail"));
      }
    } 
    catch (error) {
      console.error("Error:", error);
      alert(t("support.messageError"));
    }
  };
{/*--------------------------------------------------MAIN-----------------------------------------------------*/}
return (
  <div className="support">
    <div className={`supportSearchBox ${isSearchFocused ? "clicked" : ""}`} onClick={() => {setIsSearchFocused(true); searchInputRef.current?.focus();}} ref={searchBoxRef}>
      <input ref={searchInputRef} className="supportSearchBar" placeholder={t("support.placeholder")} value={searchQuery} onChange={handleInputChange} onKeyDown={handleKeyDown}/>
      {isSearchFocused && (<i className="fa-solid fa-x" onClick={handleClearSearch}/>)}
    </div>
{/*--------------------------------------SIDE-BAR---------------------------------------*/}
    <div className="supportContent">
      <div className={`supportSideBarBox ${Object.keys(filteredData).length === 0 ? "NoElements" : ""}`}>
      <div className="supportSideBar">
      {Object.keys(filteredData).map((category) => (
        <div key={category} className="supportSideElements">
          <h3><strong>{category}</strong></h3>
          <ul className="supportSideElements">
            {filteredData[category].map((item, index) => (
            <li className="supportSideElement" key={index} onClick={() => handleContentChange(item.issue, item.solution)}>
              <a href="#">
                {item.issue}
              </a>
            </li>
            ))}
          </ul>
        </div>
      ))}
      </div>
      </div>
{/*--------------------------------------MAIN---------------------------------------*/}
        <div className="supportMain">
          {selected.title && (<button className="supportBackButton" onClick={handleBack}>{t("support.backToSupport")}</button>)}
          <h1><strong>{selected.title || t("support.welcome")}</strong></h1>
          <p>{selected.content || t("support.selectTopic")}</p>
          {!selected.title && (<button className="supportContactButton" onClick={() => setShowContactForm(true)}>{t("support.contactSupport")}</button>)}
          {showContactForm && (
            <div className="supportContactFormBox">
              <h2 className="title"><strong>{t("support.contactSupport")}:</strong></h2>
              <form className="supportContactForm" onSubmit={handleSubmit}>
                <label htmlFor="name">{t("support.name")}</label>
                <input type="text" id="name" name="name" required />
                <label htmlFor="email">{t("support.email")}</label>
                <input type="email" id="email" name="email" required />
                <label htmlFor="message">{t("support.message")}</label>
                <textarea id="message" name="message" rows="15" required></textarea>
                <button type="submit">{t("support.submit")}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}