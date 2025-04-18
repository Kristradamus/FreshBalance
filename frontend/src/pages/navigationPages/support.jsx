import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import ScrollToTop from "../../components/reusableComponents/ScrollToTop.jsx";
import ConfirmationToast from "../../components/reusableComponents/ConfirmationToast.jsx";
import axios from "axios";
import { z } from "zod";
import "./support.css";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [charCount, setCharCount] = useState({ name: 0, message: 0 });
  const searchInputRef = useRef(null);
  const searchBoxRef = useRef(null);
  const { t } = useTranslation();
  const supportData = t("support.supportData", { returnObjects: true });
  const navigate = useNavigate();
  const location = useLocation();
  const allTopicsRef = useRef({});
  const [isLoading, setIsLoading] = useState(true);
  const { path } = useParams();
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (supportData) {
      const topicMap = {};
      Object.entries(supportData).forEach(([category, data]) => {
        data.items.forEach((topic) => {
          if (topic && topic.path) {
            topicMap[topic.path] = topic;
          }
        });
      });
      allTopicsRef.current = topicMap;
      setIsLoading(false);
    }
  }, [supportData]);

  const currentTopic = path ? allTopicsRef.current[path] : null;
  const showContactForm = location.pathname === "/support/contact";
  const currentTitle = currentTopic ? currentTopic.issue : "";
  const currentContent = currentTopic ? currentTopic.solution : "";

  useEffect(() => {
    if (!isLoading && path && !currentTopic) {
      console.warn(`Topic not found: ${path}`);
      navigate("/support", { replace: true });
    }
  }, [path, currentTopic, navigate, isLoading]);

  {/*--------------------------------------FILTERING--------------------------------------*/ }
  const filteredData = Object.keys(supportData || {}).reduce((info, category) => {
    const categoryData = supportData[category];
    const filteredTopics = categoryData.items.filter((item) => 
      item.issue.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredTopics.length > 0) {
      info[category] = {
        title: categoryData.title,
        items: filteredTopics
      };
    }
    return info;
  }, {});

  const handleBack = () => {
    navigate("/support");
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
      } else if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
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
    setCharCount((prev) => ({
      ...prev,
      [field]: e.target.value.length,
    }));
  };

  const contactFormSchema = z.object({
    name: z.string().min(3, "support.validation.name.min").max(100, "support.validation.name.max").min(1, "support.validation.name.required"),
    email: z.string().email("support.validation.email.invalid").min(1, "support.validation.email.required"),
    message: z.string().max(3000, "support.validation.message.max").min(1, "support.validation.message.required"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const data = contactFormSchema.parse({
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
      });
      e.target.reset();
      setCharCount({ name: 0, message: 0 });

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/send-message`, data);
      setToast({
        show: true,
        message: t("support.messageSent"),
        type: "success",
      });
      console.log("Success response:", response.data);
    } 
    catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        setToast({
          show: true,
          message: t(firstError.message),
          type: "error",
        });
      } 
      else if (error.response) {
        const errorData = error.response.data;
        const errorCode = errorData.errorCode;

        const toastMessage = errorCode ? t(`support.errors.${errorCode}`) : errorData.message || t("support.messageError");

        setToast({
          show: true,
          message: toastMessage,
          type: "error",
        });
      } 
      else {
        setToast({
          show: true,
          message: t("support.messageError"),
          type: "error",
        });
      }
      console.error("Error details:", error);
    }
  };

  const handleContactButtonClick = () => {
    navigate("/support/contact");
  };

  {/*--------------------------------------------------MAIN-----------------------------------------------------*/}
  return (
    <div className="support">
      <ConfirmationToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "", type: "" })} />
      <ScrollToTop />

      {/*--------------------------------------SEARCH-BAR---------------------------------------*/}
      <div className={`supportSearchBox ${isSearchFocused ? "clicked" : ""}`} onClick={() => {   setIsSearchFocused(true);   searchInputRef.current?.focus(); }} ref={searchBoxRef}>
        <input ref={searchInputRef} className="supportSearchBar" placeholder={t("support.placeholder")} value={searchQuery} onChange={handleInputChange} onKeyDown={handleKeyDown} />
        {isSearchFocused && <i className="fa-solid fa-x" onClick={handleClearSearch} />}
      </div>

      {/*--------------------------------------SIDE-BAR---------------------------------------*/}
      <div className="supportContent">
        <div className={`supportSideBarBox ${Object.keys(filteredData).length === 0 ? "NoElements" : ""}`}>
          <div className="supportSideBar">
            {Object.keys(filteredData).map((category) => (
              <div key={category} className="supportSideElements">
                <h3>{filteredData[category].title}</h3>
                <ul className="supportSideElements">
                  {filteredData[category].items.map((item, index) => (
                    <li className={`supportSideElement ${item.path === path ? "active" : ""}`} key={index} onClick={() => navigate(`/support/${item.path}`)}>
                      <Link to={`/support/${item.path}`}>{item.issue}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/*--------------------------------------MAIN---------------------------------------*/}
        <div className="supportMain">
          {currentTitle && (
            <button className="supportBackButton" onClick={handleBack}>
              {t("support.backToSupport")}
            </button>
          )}
          <h1>{currentTitle || t("support.welcome")}</h1>
          <p>{currentContent || t("support.selectTopic")}</p>
          {!currentTitle && !showContactForm && (
            <button className="supportContactButton" onClick={handleContactButtonClick}>
              {t("support.contactSupport")}
            </button>
          )}
          {showContactForm && (
            <div className="supportContactFormBox">
              <h2 className="title">{t("support.contactSupport")}:</h2>
              <form className="supportContactForm" onSubmit={handleSubmit}>
                <label htmlFor="name">
                  {t("support.name")}
                  <span className={`supportCharCounter ${charCount.name > 100 ? "error" : ""}`}>{charCount.name}/100</span>
                </label>
                <input type="text" id="name" name="name" required onChange={handleFormInputChange("name")} onKeyDown={handleKeyDown} />
                <label htmlFor="email">{t("support.email")}</label>
                <input type="email" id="email" name="email" required onKeyDown={handleKeyDown} />
                <label htmlFor="message">
                  {t("support.message")}
                  <span className={`supportCharCounter ${charCount.message > 3000 ? "error" : ""}`}>{charCount.message}/3000</span>
                </label>
                <textarea id="message" name="message" rows="15" required onChange={handleFormInputChange("message")} onKeyDown={handleKeyDown}></textarea>
                <button type="submit">{t("support.submit")}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;