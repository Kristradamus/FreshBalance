import React from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet } from 'react-router-dom';
import './profile.css';
import FavouritesComponent from "../components/FavouritesComponent.jsx";
import CartComponent from "../components/CartComponent.jsx";
import SecurityComponent from "../components/SecurityComponent.jsx";

function ProfileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = location.pathname.split('/').pop() || 'settings';

  const sidebarItems = [
    {icon: "fa-solid fa-gear", title: 'Profile Settings', key: 'settings',path: 'settings' },
    {icon: "fa-solid fa-heart", title: 'Favourites', key: 'favourites', path: 'favourites'},
    {icon: "fa-solid fa-cart-shopping", title: 'Cart', key: 'cart', path: 'cart'},
    {icon: "fa-solid fa-shield-halved", title: 'Security', key: 'security', path: 'security'}
  ];
  const handleNavigation = (path) => {
    navigate(`/profile/${path}`);
  };

  return (
    <div className="profile">
      <div className="profileSidebar">
        <h2 className>My Account</h2>
        <i class="fa-solid fa-circle-user"></i>
        <div className="profileSidebarNav">
          {sidebarItems.map((item) => (
            <button key={item.key} className={`profileButton ${activeSection === item.path ? 'active' : ''}`} onClick={() => handleNavigation(item.path)}>
              <i className={item.icon}/>
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

function ProfileSettings() {
  return (
    <div className="profileContentAria">
      <h2>Profile Settings</h2>
      <form>
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" defaultValue="John" />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" defaultValue="Doe" />
          </div>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" defaultValue="johndoe@example.com" />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" defaultValue="+1 (555) 123-4567" />
        </div>
        <button type="submit" className="save-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Routes>
      <Route path="/" element={<ProfileLayout />}>
        <Route path="settings" element={<ProfileSettings />} />
        <Route path="favourites" element={<FavouritesComponent />} />
        <Route path="cart" element={<CartComponent />} />
        <Route path="security" element={<SecurityComponent />} />
        <Route index element={<ProfileSettings />} />
      </Route>
    </Routes>
  );
}
