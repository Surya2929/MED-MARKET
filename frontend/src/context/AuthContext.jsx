import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const demoOtpLogin = (phone) => {
    const dummyUser = { 
      _id: 'guest_' + phone, 
      name: `User_${phone.slice(6)}`, 
      email: `${phone}@medmarket.in`, 
      role: 'customer', 
      token: 'dummy_demo_token_123' 
    };
    setUser(dummyUser);
    localStorage.setItem('userInfo', JSON.stringify(dummyUser));
    return { success: true };
  };

  // 🚀 FIX: LOGOUT WILL 100% CLEAR EVERYTHING AND REDIRECT
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('medCart'); // Optional: Clear cart on logout
    window.location.href = '/login'; // HARD REDIRECT TO LOGIN
  };

  return (
    <AuthContext.Provider value={{ user, login, demoOtpLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};