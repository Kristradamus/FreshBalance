import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NavigationTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    const publicPaths = [      
      "/", 
      "/about-us", 
      "/services", 
      "/subscriptions",
      "/buy-now/",
      "/try-free/",
      "/support", 
      "/support/topic/", 
      "/support/contact", 
      "/communities", 
      "/product/",
      "/single-product/",
      "/legal-policies"];
  
    const isPublicPath = publicPaths.some(
      (path) =>
        location.pathname === path ||
        (path !== "/" && location.pathname.startsWith(path))
    );
  
    if (isPublicPath) {
      sessionStorage.setItem("lastPublicPage", location.pathname);
      console.log("Stored last public page:", location.pathname);
    }
  }, [location]);
  
  return (null);
};

export default NavigationTracker;