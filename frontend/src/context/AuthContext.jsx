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

  // 🚀 NEW: Google Sign-In — credential is the ID token from Google's Identity Services popup
  const googleLogin = async (credential) => {
    try {
      const { data } = await API.post('/auth/google', { credential });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Google login failed' };
    }
  };

  // 🚀 NEW: Forgot Password flow — step 1: send OTP to the phone on file
  const sendResetOtp = async (phone) => {
    try {
      await API.post('/auth/send-otp', { phone });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to send OTP' };
    }
  };

  // 🚀 NEW: Forgot Password flow — step 2: verify OTP + set new password
  const resetPassword = async (phone, otp, newPassword) => {
    try {
      const { data } = await API.post('/auth/reset-password', { phone, otp, newPassword });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to reset password' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('medCart'); 
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, otpLogin, googleLogin, sendResetOtp, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};