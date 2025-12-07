import { createContext, useState, useEffect, useContext } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from backend on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      
      if (accessToken && userId) {
        try {
          const response = await api.get(`/users/${userId}`);
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If token is invalid, clear everything
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    
    fetchUserData();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user: userData, tokens } = response.data.data;

      // Store only tokens and userId
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('userId', userData._id);

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Fetch latest user data from server
  const refreshUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const response = await api.get(`/users/${userId}`);
        const freshUserData = response.data.data.user;
        setUser(freshUserData);
        return freshUserData;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Register function
  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { user: userData, tokens } = response.data.data;

      // Store only tokens and userId
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('userId', userData._id);

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Throw error so component can catch it
    }
  };

  // Logout function
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // Update user (after profile edit)
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('accessToken');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUserData,
    isAdmin,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
