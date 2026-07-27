import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';
    const isAuthExpired = status === 401;
    const isSuspended = status === 403 && message.toLowerCase().includes('suspend');

    if ((isAuthExpired || isSuspended) && localStorage.getItem('userInfo')) {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('medCart');
      alert(isSuspended ? 'Your account has been suspended by Admin.' : 'Your session has expired. Please log in again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;