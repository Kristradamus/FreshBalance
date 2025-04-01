import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const checkAuthStatus = async () => {
    setIsLoading(true);
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      
      if (decoded.exp * 1000 > Date.now()) {
        try {
          const response = await fetch("http://localhost:5000/validate-token", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            credentials: "include"
          });
          
          if (response.ok) {
            const data = await response.json();
            setIsAuthenticated(true);
            setUser({
              id: decoded.userId,
              username: decoded.username,
              email: decoded.email,
            });
          }
          
          else {
            console.error("Server rejected token");
            localStorage.removeItem("authToken");
            setIsAuthenticated(false);
            setUser(null);
          }
        }
        
        catch (serverError) {
          console.error("Server validation error:", serverError);
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      
      else {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    
    catch (error) {
      console.error("Token validation error:", error);
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
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
    setUser(null);
  };
  
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      isLoading, 
      checkAuthStatus,
      login,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};