import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import MainLayout from "./components/layout/MainLayout.jsx";
import ScrollToTop from "./components/reusableComponents/ScrollToTop.jsx";
import LoadingAnimation from "./components/layout/LoadingAnimation.jsx";
import { AuthProvider } from "./components/protectionComponents/AuthContext.jsx";
import ProtectedRoute from "./components/protectionComponents/ProtectedRoute.jsx";
import ProtectedRouteAdmin from "./components/protectionComponents/ProtectedRouteAdmin.jsx";
import NavigationTracker from "./components/reusableComponents/NavigationTracker.jsx";
import RedirectTo from "./components/protectionComponents/RedirectTo.jsx";

const Admin = React.lazy(() => import("./pages/headerPages/admin.jsx"));
const AboutUs = React.lazy(() => import("./pages/navigationPages/aboutUs.jsx"));
const Communities = React.lazy(() =>
  import("./pages/navigationPages/communities.jsx")
);
const FrontPage = React.lazy(() => import("./pages/frontPage.jsx"));
const LoginRegistration = React.lazy(() =>
  import("./pages/headerPages/loginRegistration.jsx")
);
const Profile = React.lazy(() => import("./pages/headerPages/profile.jsx"));
const Services = React.lazy(() =>
  import("./pages/navigationPages/services.jsx")
);
const Subscriptions = React.lazy(() =>
  import("./pages/navigationPages/subscriptions.jsx")
);
const Support = React.lazy(() => import("./pages/navigationPages/support.jsx"));
const ProductPage = React.lazy(() =>
  import("./pages/productPages/productPage.jsx")
);
const LegalPage = React.lazy(() =>
  import("./pages/navigationPages/legalPage.jsx")
);

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <AuthProvider>
          <NavigationTracker />
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
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRouteAdmin>
                      <Admin />
                    </ProtectedRouteAdmin>
                  }
                />
                <Route
                  path="/profile/*"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/product/:promotionName"
                  element={<ProductPage />}
                />
                <Route path="/legal-policies" element={<LegalPage />} />
              </Route>
              <Route path="/communities" element={<Communities />} />
              <Route
                path="/email-check/*"
                element={
                  <RedirectTo>
                    <LoginRegistration />
                  </RedirectTo>
                }
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
