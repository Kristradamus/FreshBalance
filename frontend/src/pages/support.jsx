import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import TermsAndConditions from "./legalPage.jsx";
import axios from "axios";
import "./support.css";

export default function Support() {
const [selected, setSelected] = useState({ title: "", content: "" });
const [searchQuery, setSearchQuery] = useState("");
const [showContactForm, setShowContactForm] = useState(false);
const [isSearchFocused, setIsSearchFocused] = useState(false);
const [charCount, setCharCount] = useState({ name: 0, message: 0 });
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
},{});

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
    if (e.target === searchInputRef.current) {
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
    }
    else if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      e.target.blur();
    }
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
const handleFormInputChange = (field) => (e) => {
  setCharCount(prev => ({
    ...prev,
    [field]: e.target.value.length
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  if (data.name.length > 100) {
    alert(t("support.nameIsTooLong"));
    return;
  }
  if (data.message.length > 3000) {
    alert(t("support.messageIsTooLong"));
    return;
  }
  e.target.reset();
  setCharCount({ name: 0, message: 0 });
  console.log("Submitting form data:", data);

  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/send-message`, data);
    console.log("Success response:", response.data);
    alert(t("support.messageSent"));
  } 
  catch (error) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    alert(t("support.messageError"));
  }
};

{/*--------------------------------------------------MAIN-----------------------------------------------------*/}
return (
  <div className="support">

    {/*--------------------------------------SEARCH-BAR---------------------------------------*/}
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
        {selected.title !== "Terms and Conditions" ?(
          <p>{selected.content || t("support.selectTopic")}</p>
          ) : (
          <TermsAndConditions/>
        )}
        {!selected.title && (<button className="supportContactButton" onClick={() => setShowContactForm(true)}>{t("support.contactSupport")}</button>)}
        {showContactForm && (
          <div className="supportContactFormBox">
            <h2 className="title"><strong>{t("support.contactSupport")}:</strong></h2>
            <form className="supportContactForm" onSubmit={handleSubmit}>
              <label htmlFor="name">
                {t("support.name")}
                <span className={`supportCharCounter ${charCount.name > 100 ? 'error' : ''}`}>
                  {charCount.name}/100
                </span>
              </label>
              <input type="text" id="name" name="name" required onChange={handleFormInputChange('name')} onKeyDown={handleKeyDown}/>
              <label htmlFor="email">{t("support.email")}</label>
              <input type="email" id="email" name="email" required onKeyDown={handleKeyDown}/>
              <label htmlFor="message">
                  {t("support.message")}
                  <span className={`supportCharCounter ${charCount.message > 3000 ? 'error' : ''}`}>
                    {charCount.message}/3000
                  </span>
              </label>
              <textarea id="message" name="message" rows="15" required onChange={handleFormInputChange('message')} onKeyDown={handleKeyDown}></textarea>
              <button type="submit">{t("support.submit")}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  </div>
);}