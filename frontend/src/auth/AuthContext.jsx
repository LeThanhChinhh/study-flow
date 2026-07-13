import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAuthSuccess = (data) => {
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      setToken(data.accessToken);
    }
    if (data.user) {
      setUser(data.user);
    }
  };

  const updateUser = useCallback((nextUser) => {
    setUser((currentUser) => ({ ...currentUser, ...nextUser }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const data = await authApi.getMe();
        if (data) {
          // Sometimes getMe wraps user in data, or returns user directly
          setUser(data.user || data);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
        // Token might be expired or invalid
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [token, logout]);

  const login = async (payload) => {
    setIsLoading(true);
    clearError();
    try {
      const data = await authApi.login(payload);
      handleAuthSuccess(data);
      return data;
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload) => {
    setIsLoading(true);
    clearError();
    try {
      const data = await authApi.register(payload);
      handleAuthSuccess(data);
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    isInitializing,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
