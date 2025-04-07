import React from "react";
import { Routes, Route, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./admin.css";

import ProductManagement from "../../components/adminComponents/ProductManagement.jsx";
import AccountManagement from "../../components/adminComponents/AccountManagement.jsx";
import AdminOrders from "../../components/adminComponents/AdminOrders.jsx";
import AdminSettings from "../../components/adminComponents/AdminSettings.jsx";
import LogOutComponent from "../../components/reusableComponents/LogOut.jsx";

function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = location.pathname.split("/").pop() || "settings";

  const sidebarItems = t("admin.sidebarItems", {returnObject:true});

  const handleNavigation = (item) => {
    if (item.isLogout) {
      navigate("logout");
    } 
    else {
      navigate(item.path);
    }
  };

  return (
    <div className="admin">
      <div className="adminSidebar">
        <h2>{t("admin.sidebarMainTitle")}</h2>
        <i className="fa-solid fa-circle-user"></i>
        <div className="adminSidebarNav">
          {sidebarItems.map((item) => (
            <button key={item.key} className={`adminButton ${activeSection === item.path ? "active" : ""}`} onClick={() => handleNavigation(item)} >
              <i className={item.icon} />
              <p>{item.title}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="adminContentArea">
        <Outlet />
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route path="products" element={<ProductManagement />} />
        <Route path="accounts" element={<AccountManagement />} />
        <Route path="orders" element={<AdminOrders/>} />
        <Route path="settings" element={<AdminSettings/>} />
        <Route path="logout" element={<LogOutComponent />} />
      </Route>
    </Routes>
  );
}