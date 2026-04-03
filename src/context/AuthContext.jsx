import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/api';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedOut = localStorage.getItem('loggedOut');
    if (loggedOut) {
      setUser(null);
      setLoading(false);
      return;
    }
    getProfile()
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.removeItem('loggedOut');
  };

  const logout = async () => {
    setUser(null);
    localStorage.setItem('loggedOut', 'true');
    window.location.href = '/';
    // Call API in background to clear session
    API.post('/users/logout', {}).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
