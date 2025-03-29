import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  const verifyAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setAuthState(prev => ({ ...prev, isAuthenticated: false, user: null, isLoading: false }));
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/verify-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAuthState({
        isAuthenticated: true,
        user: response.data.user,
        isLoading: false
      });
    } catch (error) {
      console.error("Auth verification failed:", error);
      localStorage.removeItem('authToken');
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
    }
  }, []);

  const login = useCallback(async (token, userData) => {
    localStorage.setItem('authToken', token);
    setAuthState({
      isAuthenticated: true,
      user: userData,
      isLoading: false
    });
    // Optional: Verify with backend
    await verifyAuth();
  }, [verifyAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  }, []);

  // Initialize auth state
  useEffect(() => {
    verifyAuth();
    
    // Sync across tabs
    const handleStorageChange = () => verifyAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [verifyAuth]);

  return (
    <AuthContext.Provider value={{ 
      ...authState,
      login,
      logout,
      verifyAuth
    }}>
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};