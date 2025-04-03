import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import ScrollToTop from "../../components/reusableComponents/ScrollToTop.jsx";
import axios from "axios";
import { z } from "zod";
import "./support.css";

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [charCount, setCharCount] = useState({ name: 0, message: 0 });
  const searchInputRef = useRef(null);
  const searchBoxRef = useRef(null);
  const { t } = useTranslation();
  const supportData = t("support.supportData", { returnObjects: true });
  const navigate = useNavigate();
  const location = useLocation();
  const { topicId } = useParams();
  const allTopicsRef = useRef({});

  useEffect(() => {
    <ScrollToTop />;
  }, [location.pathname]);

  useEffect(() => {
    const topicMap = {};
    Object.values(supportData || {})
      .flat()
      .forEach((topic) => {
        if (topic && topic.issue) {
          const id = encodeURIComponent(
            topic.issue.toLowerCase().replace(/\s+/g, "-")
          );
          topicMap[id] = topic;
        }
      });
    allTopicsRef.current = topicMap;
  }, [supportData]);

  const currentTopic = topicId ? allTopicsRef.current[topicId] : null;
  const showContactForm = location.pathname === "/support/contact";
  const currentTitle = currentTopic ? currentTopic.issue : "";
  const currentContent = currentTopic ? currentTopic.solution : "";

  {
    /*--------------------------------------FILTERING--------------------------------------*/
  }
  const filteredData = Object.keys(supportData || {}).reduce(
    (info, category) => {
      const filteredTopics = supportData[category].filter((item) =>
        item.issue.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filteredTopics.length > 0) {
        info[category] = filteredTopics;
      }
      return info;
    },
    {}
  );

  const handleBack = () => {
    navigate("/support");
  };

  {
    /*--------------------------------------SEARCH-BAR--------------------------------------*/
  }
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      if (e.target === searchInputRef.current) {
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      } else if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
      ) {
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

  {
    /*----------------------------------EMAIL-SENDING-------------------------------------*/
  }
  const handleFormInputChange = (field) => (e) => {
    setCharCount((prev) => ({
      ...prev,
      [field]: e.target.value.length,
    }));
  };

  const contactFormSchema = z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters!")
      .max(100, "Name must be less than 100 characters!")
      .min(1, "Name is required!"),
    email: z
      .string()
      .email("Invalid email address!")
      .min(1, "Email is required!"),
    message: z
      .string()
      .max(3000, "Message must be less than 3000 characters!")
      .min(1, "Message is required!"),
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

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/send-message`,
        data
      );
      alert(t("support.messageSent"));
      console.log("Success response:", response.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        alert(firstError.message);
      } else if (error.response) {
        let errorMessage;
        if (error.response.status === 429) {
          errorMessage =
            error.response.data?.message || t("support.tooManyAttempts");
        } else if (error.response.status === 400) {
          errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            t("support.messageError");
        }
        alert(errorMessage);
      } else {
        alert(t("support.messageError"));
      }
      console.error("Error details:", error);
    }
  };

  const handleContactButtonClick = () => {
    navigate("/support/contact");
  };

  {
    /*--------------------------------------------------MAIN-----------------------------------------------------*/
  }
  return (
    <div className="support">
      {/*--------------------------------------SEARCH-BAR---------------------------------------*/}
      <div
        className={`supportSearchBox ${isSearchFocused ? "clicked" : ""}`}
        onClick={() => {
          setIsSearchFocused(true);
          searchInputRef.current?.focus();
        }}
        ref={searchBoxRef}
      >
        <input
          ref={searchInputRef}
          className="supportSearchBar"
          placeholder={t("support.placeholder")}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {isSearchFocused && (
          <i className="fa-solid fa-x" onClick={handleClearSearch} />
        )}
      </div>

      {/*--------------------------------------SIDE-BAR---------------------------------------*/}
      <div className="supportContent">
        <div
          className={`supportSideBarBox ${
            Object.keys(filteredData).length === 0 ? "NoElements" : ""
          }`}
        >
          <div className="supportSideBar">
            {Object.keys(filteredData).map((category) => (
              <div key={category} className="supportSideElements">
                <h3>{category}</h3>
                <ul className="supportSideElements">
                  {filteredData[category].map((item, index) => (
                    <li className="supportSideElement" key={index}>
                      <Link to={`/support/topic/${encodeURIComponent(item.issue.toLowerCase().replace(/\s+/g, "-"))}`}>
                        {item.issue}
                      </Link>
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
          {currentTitle !== "Terms and Conditions" ? (
            <p>{currentContent || t("support.selectTopic")}</p>
          ) : (
            <TermsAndConditions />
          )}
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
                  <span className={`supportCharCounter ${charCount.name > 100 ? "error" : "" }`}>
                    {charCount.name}/100
                  </span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  onChange={handleFormInputChange("name")}
                  onKeyDown={handleKeyDown}
                />
                <label htmlFor="email">{t("support.email")}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  onKeyDown={handleKeyDown}
                />
                <label htmlFor="message">
                  {t("support.message")}
                  <span
                    className={`supportCharCounter ${
                      charCount.message > 3000 ? "error" : ""
                    }`}
                  >
                    {charCount.message}/3000
                  </span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="15"
                  required
                  onChange={handleFormInputChange("message")}
                  onKeyDown={handleKeyDown}
                ></textarea>
                <button type="submit">{t("support.submit")}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
