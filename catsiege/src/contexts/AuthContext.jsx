import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const checkAuth = useCallback(async () => {
    if (isCheckingAuth) return;

    setIsCheckingAuth(true);

    try {
      const token = localStorage.getItem("tokenCat");

      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await authService.me();

      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("tokenCat");
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
      setLoading(false);
    }
  }, [isCheckingAuth]);

  useEffect(() => {
    const token = localStorage.getItem("tokenCat");
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("tokenCat");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("tokenCat");
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
