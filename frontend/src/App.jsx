import { Suspense } from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
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
const Communities = React.lazy(() => import("./pages/navigationPages/communities.jsx"));
const FrontPage = React.lazy(() => import("./pages/frontPage.jsx"));
const LoginRegistration = React.lazy(() => import("./pages/headerPages/loginRegistration.jsx"));
const Profile = React.lazy(() => import("./pages/headerPages/profile.jsx"));
const Services = React.lazy(() => import("./pages/navigationPages/services.jsx"));
const Subscriptions = React.lazy(() =>import("./pages/navigationPages/subscriptions.jsx"));
const Support = React.lazy(() => import("./pages/navigationPages/support.jsx"));
const ProductPage = React.lazy(() =>import("./pages/productPages/productPage.jsx"));
const LegalPage = React.lazy(() =>import("./pages/navigationPages/legalPage.jsx"));
const BuyNowSubscription = React.lazy(() => import("./pages/navigationPages/buyNowSubscription.jsx"));
const TryFreeSubscription = React.lazy(() => import("./pages/navigationPages/tryFreeSubscription.jsx"));
const SingleProductPage = React.lazy(() => import("./pages/productPages/singleProductPage.jsx"));

const App = () => {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <NavigationTracker />
          <Suspense fallback={<LoadingAnimation />}>
            <ScrollToTop />
            <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<FrontPage />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/buy-now/*" element={<ProtectedRoute><BuyNowSubscription/></ProtectedRoute>} />
                  <Route path="/try-free/*" element={<ProtectedRoute><TryFreeSubscription/></ProtectedRoute>} />
                  <Route path="/support" element={<Support />}/>
                  <Route path="/support/:path" element={<Support />} />
                  <Route path="/support/contact" element={<Support />} />
                  <Route path="/admin/*"element={<ProtectedRouteAdmin><Admin /></ProtectedRouteAdmin>} />
                  <Route path="/profile/*" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/product/:promotionName" element={<ProductPage />} />
                  <Route path="/single-product/:promotionName" element={<SingleProductPage/>}></Route>
                  <Route path="/legal-policies" element={<LegalPage />} />
                  <Route path="/communities" element={<Communities />}/>
                </Route>
              <Route path="/email-check/*" element={<RedirectTo><LoginRegistration /></RedirectTo>} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
};

export default App;