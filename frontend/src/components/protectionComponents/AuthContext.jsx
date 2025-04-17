import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const checkAuthStatus = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      setIsAdmin(false);
      return;
    }
    
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      
      if (decoded.exp * 1000 > Date.now()) {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/validate-token`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            setIsAuthenticated(true);
            setUser({
              id: decoded.userId,
              username: decoded.username,
              email: decoded.email,
              role:decoded.role || "user"
            });
            setIsAdmin(decoded.role === "admin");
          }
          else {
            console.error("Server rejected token");
            localStorage.removeItem("authToken");
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUser(null);
          }
        }
        catch (serverError) {
          console.error("Server validation error:", serverError);
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
        }
      }
      else {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      }
    }
    catch (error) {
      console.error("Token validation error:", error);
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
    }
    finally {
      setIsLoading(false);
    }
  };
  
  const login = async (token) => {
    localStorage.setItem("authToken", token);
    await checkAuthStatus();
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };
  
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{isAuthenticated, isAdmin, user, isLoading, checkAuthStatus, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};