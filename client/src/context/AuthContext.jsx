import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved user session (mocked for now)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login logic
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: '1',
          name: 'Demo User',
          email,
          role: email === 'admin@bidmaster.com' ? 'admin' : 'user',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-jwt-token');
        resolve(mockUser);
      }, 1000);
    });
  };

  const register = async (name, email, password) => {
    // Mock register logic
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: '2',
          name,
          email,
          role: 'user',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-jwt-token');
        resolve(mockUser);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
