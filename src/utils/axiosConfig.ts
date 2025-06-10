import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { URL } from '../utils/shared';

// Create axios instance with consistent base URL
const axiosInstance = axios.create({
  baseURL: URL, // Use the shared URL which already includes /api
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor for adding token
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token && config.url && !['/auth/login', '/auth/register', '/auth/verify-otp', '/auth/forgot-password', '/auth/reset-password'].includes(config.url)) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      
      // Don't retry for auth endpoints
      if (originalRequest.url && ['/auth/login', '/auth/register', '/auth/verify-otp'].includes(originalRequest.url)) {
        return Promise.reject(error);
      }

      // Clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;