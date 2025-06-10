import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void; // Add setUser function
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    } else if (storedUser) {
    } else {
    }

    setIsLoading(false);
  }, []);

  // Provide the context value
  const value = {
    user,
    token,
    login: async (token: string, user: User) => {
      try {
        setToken(token);
        setUser(user);
        await localStorage.setItem('token', token);
        await localStorage.setItem('user', JSON.stringify(user));

        // Verify token storage
        const storedToken = await localStorage.getItem('token');
        if (storedToken !== token) {
          throw new Error('Failed to store token in localStorage');
        }
      } catch (error) {
        throw error;
      }
    },
    logout: () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setUser, // Provide setUser
    isAuthenticated: !!user,
    isLoading,
    refreshToken: async () => {
      // Logic to refresh token
      // Check if the token is expired and handle accordingly
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // TO DO: Implement token expiration logic
        // For now, just log a message
      } else {
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};