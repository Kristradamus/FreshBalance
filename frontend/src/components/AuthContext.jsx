import React, { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const checkAuthStatus = () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      
      if (decoded.exp * 1000 > Date.now()) {
        setIsAuthenticated(true);
        setUser({
          id: decoded.userId,
          username: decoded.username,
          email: decoded.email
        });
      } else {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Token validation error:", error);
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, checkAuthStatus, isLoading, logout}}>
      {children}
    </AuthContext.Provider>
  );
};