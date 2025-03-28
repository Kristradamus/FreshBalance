import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import MainLayout from "./components/MainLayout";
import ScrollToTop from "./components/ScrollToTop.jsx";
import LoadingAnimation from "./components/LoadingAnimation.jsx";
import { AuthProvider } from "./components/AuthContext.jsx";
import ProtectedRoute from './components/ProtectedRoute.jsx';

const AboutUs = React.lazy(() => import("./pages/aboutUs.jsx"));
const Communities = React.lazy(() => import("./pages/communities.jsx"));
const FrontPage = React.lazy(() => import("./pages/frontPage.jsx"));
const LoginRegistration = React.lazy(() =>import("./pages/loginRegistration.jsx"));
const Profile = React.lazy(() => import("./pages/profile.jsx"));
const Services = React.lazy(() => import("./pages/services.jsx"));
const Subscriptions = React.lazy(() => import("./pages/subscriptions.jsx"));
const Support = React.lazy(() => import("./pages/support.jsx"));
const ProductPage = React.lazy(() => import("./pages/productPage.jsx"));
const LegalPage = React.lazy(() => import("./pages/legalPage.jsx"));

export default function App() {

return (
  <div>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingAnimation />}>
          <ScrollToTop />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/" element={<FrontPage />} />
              <Route path="/services" element={<Services />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/support" element={<Support />} />
              <Route path="/support/topic/:topicId" element={<Support />} />
              <Route path="/support/contact" element={<Support />} />
              <Route path="/cart" element={<Profile />} />
              <Route path="/favourites" element={<Profile />} />
              <Route path="/profile/*" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/product/:promotionName" element={<ProductPage />} />
              <Route path="/legal-policies" element={<LegalPage />} />
            </Route>
            <Route path="/communities" element={<Communities />} />
            <Route path="/email-check/*" element={<LoginRegistration />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </div>
);};