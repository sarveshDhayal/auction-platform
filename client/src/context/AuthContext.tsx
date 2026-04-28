import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => Promise.resolve(),
  googleLogin: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => { }
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Validate session on load
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
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

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token } = response.data.data;

      localStorage.setItem('token', token);
      setUser(userData);

      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await api.post('/auth/google', { credential });
      // The backend returns { status, token, data: { ...user } }
      const token = response.data.token;
      const userData = response.data.data.user;

      localStorage.setItem('token', token);
      setUser(userData);

      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Google Login failed';
      throw new Error(message);
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await api.post('/auth/register', { fullName, email, password });
      const { user: userData, token } = response.data.data;

      localStorage.setItem('token', token);
      setUser(userData);

      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const value = {
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
