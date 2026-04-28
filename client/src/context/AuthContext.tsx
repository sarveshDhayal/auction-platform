import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  googleLogin: (credential: string) => Promise<any>;
  register: (fullName: string, email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Validate session on load
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      if (token) localStorage.removeItem('token'); // Clean up bad strings
      setLoading(false);
      return;
    }

    try {
      const response = await api.get<any>('/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Session validation failed:', error);
      // Invalid token, clear it
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    // Listen for unauthorized events from api interceptor
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<any>('/auth/login', { email, password });
      const { user: userData, token } = response.data.data;

      localStorage.setItem('token', token);
      setUser(userData);

      return userData;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      const response = await api.post<any>('/auth/google', { credential });
      const { user: userData, token } = response.data.data;

      localStorage.setItem('token', token);
      setUser(userData);

      return userData;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Google Login failed';
      throw new Error(message);
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const response = await api.post<any>('/auth/register', { fullName, email, password });
      const { user: userData, token } = response.data.data;

      localStorage.setItem('token', token);
      setUser(userData);

      return userData;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const value: AuthContextType = {
    user,
    login,
    googleLogin,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
