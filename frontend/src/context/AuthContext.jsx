import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedUser = localStorage.getItem('userInfo');
      if (!storedUser) { setCheckingSession(false); return; }

      try {
        setUser(JSON.parse(storedUser));
        await API.get('/users/profile');
      } catch (err) {
        if (err.response?.status === 401) {
          setUser(null);
        }
      } finally {
        setCheckingSession(false);
      }
    };
    verifySession();
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

  const sendResetOtp = async (phone) => {
    try {
      await API.post('/auth/send-otp', { phone });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to send OTP' };
    }
  };

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
    <AuthContext.Provider value={{ user, login, googleLogin, sendResetOtp, resetPassword, logout, checkingSession }}>
      {children}
    </AuthContext.Provider>
  );
};