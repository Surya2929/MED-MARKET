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

  // 🚀 FIX: REAL OTP LOGIN (Ab Backend se Asli Token aayega)
  const otpLogin = async (phone, otp) => {
    try {
      const { data } = await API.post('/auth/verify-otp', { phone, otp });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Invalid OTP' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('medCart'); 
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, otpLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};