import React from "react";
import { Routes, Route, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./admin.css";

// Import admin components
import ProductManagementComponent from "../../components/adminComponents/ProductManagementComponent.jsx";
import AccountManagementComponent from "../../components/adminComponents/AccountManagementComponent.jsx";
import OrdersComponent from "../../components/adminComponents/OrdersComponent.jsx";
import AnalyticsComponent from "../../components/adminComponents/AnalyticsComponent.jsx";
import SettingsComponent from "../../components/adminComponents/SettingsComponent.jsx";
import LogOutComponent from "../../components/adminComponents/LogOut.jsx";

function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = location.pathname.split("/").pop() || "dashboard";

  const sidebarItems = [
    { icon: "fa-solid fa-chart-line", title: "Dashboard", key: "dashboard", path: "dashboard" },
    { icon: "fa-solid fa-box", title: "Product Management", key: "products", path: "products" },
    { icon: "fa-solid fa-users", title: "Account Management", key: "accounts", path: "accounts" },
    { icon: "fa-solid fa-shopping-bag", title: "Orders", key: "orders", path: "orders" },
    { icon: "fa-solid fa-chart-pie", title: "Analytics", key: "analytics", path: "analytics" },
    { icon: "fa-solid fa-gear", title: "Settings", key: "settings", path: "settings" },
    { icon: "fa-solid fa-right-from-bracket", title: "Log out", key: "logout", path: "logout", isLogout: true },
  ];

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
        <h2>{t("admin.sideBarMainTitle", "Admin Panel")}</h2>
        <i className="fa-solid fa-user-shield adminIcon"></i>
        <div className="adminSidebarNav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`adminButton ${activeSection === item.path ? "active" : ""}`}
              onClick={() => handleNavigation(item)}
            >
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

/*--------------------------------------ADMIN-DASHBOARD--------------------------------------------*/
function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="adminContentAreaDashboard">
      <h2 className="dashboardMainTitle">{t("admin.dashboardMainTitle", "Dashboard Overview")}</h2>
      
      <div className="dashboardStats">
        <div className="statCard">
          <div className="statIcon">
            <i className="fa-solid fa-box"></i>
          </div>
          <div className="statInfo">
            <h3>Total Products</h3>
            <p>128</p>
          </div>
        </div>
        
        <div className="statCard">
          <div className="statIcon">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="statInfo">
            <h3>Total Users</h3>
            <p>1,254</p>
          </div>
        </div>
        
        <div className="statCard">
          <div className="statIcon">
            <i className="fa-solid fa-shopping-bag"></i>
          </div>
          <div className="statInfo">
            <h3>New Orders</h3>
            <p>32</p>
          </div>
        </div>
        
        <div className="statCard">
          <div className="statIcon">
            <i className="fa-solid fa-dollar-sign"></i>
          </div>
          <div className="statInfo">
            <h3>Revenue (Monthly)</h3>
            <p>$12,456</p>
          </div>
        </div>
      </div>
      
      <div className="recentActivity">
        <h3>Recent Activity</h3>
        <div className="activityList">
          <div className="activityItem">
            <i className="fa-solid fa-shopping-bag"></i>
            <p>New order #1089 - $156.99</p>
            <span className="activityTime">5 min ago</span>
          </div>
          <div className="activityItem">
            <i className="fa-solid fa-user-plus"></i>
            <p>New user registration - Sarah Johnson</p>
            <span className="activityTime">20 min ago</span>
          </div>
          <div className="activityItem">
            <i className="fa-solid fa-box"></i>
            <p>Product stock update - "Wireless Headphones" (25 added)</p>
            <span className="activityTime">1 hour ago</span>
          </div>
          <div className="activityItem">
            <i className="fa-solid fa-comment"></i>
            <p>New product review - 5 stars on "Smartphone X1"</p>
            <span className="activityTime">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/*--------------------------------------PRODUCT-MANAGEMENT--------------------------------------------*/
function ProductManagement() {
  const { t } = useTranslation();

  return (
    <div className="adminContentAreaProducts">
      <div className="productManagementHeader">
        <h2>{t("admin.productsMainTitle", "Product Management")}</h2>
        <button className="addProductBtn">
          <i className="fa-solid fa-plus"></i>
          {t("admin.addProduct", "Add New Product")}
        </button>
      </div>
      
      <div className="productFilters">
        <div className="searchFilter">
          <input type="text" placeholder="Search products..." />
          <button><i className="fa-solid fa-search"></i></button>
        </div>
        <div className="categoryFilter">
          <select>
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Kitchen</option>
            <option value="beauty">Beauty & Personal Care</option>
          </select>
        </div>
        <div className="stockFilter">
          <select>
            <option value="">Stock Status</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>
      
      <ProductManagementComponent />
    </div>
  );
}

/*--------------------------------------ACCOUNT-MANAGEMENT--------------------------------------------*/
function AccountManagement() {
  const { t } = useTranslation();

  return (
    <div className="adminContentAreaAccounts">
      <div className="accountManagementHeader">
        <h2>{t("admin.accountsMainTitle", "Account Management")}</h2>
        <button className="addAccountBtn">
          <i className="fa-solid fa-user-plus"></i>
          {t("admin.addAccount", "Add New Account")}
        </button>
      </div>
      
      <div className="accountFilters">
        <div className="searchFilter">
          <input type="text" placeholder="Search users..." />
          <button><i className="fa-solid fa-search"></i></button>
        </div>
        <div className="roleFilter">
          <select>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        <div className="statusFilter">
          <select>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <AccountManagementComponent />
    </div>
  );
}

/*--------------------------------------ADMIN-ROUTING--------------------------------------------*/
export default function AdminPage() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="accounts" element={<AccountManagement />} />
        <Route path="orders" element={<OrdersComponent />} />
        <Route path="analytics" element={<AnalyticsComponent />} />
        <Route path="settings" element={<SettingsComponent />} />
        <Route path="logout" element={<LogOutComponent />} />
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
}