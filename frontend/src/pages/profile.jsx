import React from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import FavouritesComponent from "../components/profileComponents/FavouritesComponent.jsx";
import CartComponent from "../components/profileComponents/CartComponent.jsx";
import SecurityComponent from "../components/profileComponents/SecurityComponent.jsx";
import LogOutComponent from "../components/profileComponents/LogOut.jsx";
import { useTranslation } from "react-i18next";
import "./profile.css";

function ProfileLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = location.pathname.split("/").pop() || "settings";

  const sidebarItems = [
    {
      icon: "fa-solid fa-gear",
      title: "Profile Settings",
      key: "settings",
      path: "settings",
    },
    {
      icon: "fa-solid fa-heart",
      title: "Favourites",
      key: "favourites",
      path: "favourites",
    },
    {
      icon: "fa-solid fa-cart-shopping",
      title: "Cart",
      key: "cart",
      path: "cart",
    },
    {
      icon: "fa-solid fa-shield-halved",
      title: "Security",
      key: "security",
      path: "security",
    },
    {
      icon: "fa-solid fa-right-from-bracket",
      title: "Log out",
      key: "logout",
      path: "logout",
      isLogout: true,
    },
  ];

  const handleNavigation = (item) => {
    if (item.isLogout) {
      navigate("logout"); // Changed from "/profile/logout" to just "logout"
    } else {
      navigate(item.path); // Changed from `/profile/${item.path}` to just item.path
    }
  };
  return (
    <div className="profile">
      <div className="profileSidebar">
        <h2>{t("profile.sideBarMainTitle")}</h2>
        <i className="fa-solid fa-circle-user"></i>
        <div className="profileSidebarNav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`profileButton ${
                activeSection === item.path ? "active" : ""
              }`}
              onClick={() => handleNavigation(item)}
            >
              <i className={item.icon} />
              <p>{item.title}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="profileContentArea">
        <Outlet />
      </div>
    </div>
  );
}

{
  /*--------------------------------------PROFILE-SETTINGS--------------------------------------------*/
}
function ProfileSettings() {
  const { t } = useTranslation();

  return (
    <div className="profileContentAriaSettings">
      <h2 className="settingsMainTitle">{t("profile.settingsMainTitle")}</h2>
      <form>
        <div className="settingsFormRow">
          <div className="settingsFormGroup">
            <label>{t("profile.settingsFirstName")}</label>
            <input type="text" defaultValue="John" />
          </div>
          <div className="settingsFormGroup">
            <label>{t("profile.settingsLastName")}</label>
            <input type="text" defaultValue="Doe" />
          </div>
        </div>
        <div className="settingsFormGroup">
          <label>{t("profile.settingsEmail")}</label>
          <input type="email" defaultValue="johndoe@example.com" />
        </div>
        <div className="settingsFormGroup">
          <label>{t("profile.settingsPhoneNumber")}</label>
          <input type="tel" defaultValue="+1 (555) 123-4567" />
        </div>
        <button type="submit" className="settingsSaveBtn">
          <i className="fa-solid fa-floppy-disk"></i>
          {t("profile.settingsSaveChanges")}
        </button>
      </form>
    </div>
  );
}

{
  /*--------------------------------------PROFILE-ROUTING--------------------------------------------*/
}
export default function ProfilePage() {
  return (
    <Routes>
      <Route path="/" element={<ProfileLayout />}>
        <Route path="settings" element={<ProfileSettings />} />
        <Route path="favourites" element={<FavouritesComponent />} />
        <Route path="cart" element={<CartComponent />} />
        <Route path="security" element={<SecurityComponent />} />
        <Route path="logout" element={<LogOutComponent />} />
        <Route index element={<ProfileSettings />} />
      </Route>
    </Routes>
  );
}
