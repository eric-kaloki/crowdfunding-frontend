import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import {URL} from '../utils/shared';
// Centralized API configuration
const API_BASE_URL = 
  process.env.NODE_ENV === 'development' 
    ? 'https://crowdfunding-backend-r9z5.onrender.com/api' 
    : `${URL}api`;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://crowdfunding-backend-r9z5.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
  timeout: 30000, // 30 second timeout
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
  response => {
    // Check for new token in response headers
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('token', newToken);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
    return response;
  },
  async error => {
    console.log('Axios error interceptor:', error.code, error.message);
    
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        const originalRequest = error.config;
        
        // Don't retry for auth endpoints
        if (originalRequest.url && ['/auth/login', '/auth/register', '/auth/verify-otp'].includes(originalRequest.url)) {
          return Promise.reject(error);
        }

        // If this is already a retry or refresh token request
        if (originalRequest._retry || originalRequest.url === '/auth/refresh-token') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Try to refresh token
        try {
          originalRequest._retry = true;
          const response = await axiosInstance.post('/auth/refresh-token');
          const newToken = response.data.token;
          
          localStorage.setItem('token', newToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          
          // Retry original request
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }
      
      // Show error toast for non-auth errors (except registration timeouts)
      if (error.response.status !== 401 && 
          !error.response.config?.url?.includes('/auth/') &&
          error.code !== 'ECONNABORTED') {
        toast({
          title: "Error",
          description: error.response.data.error || "An error occurred",
          variant: "destructive",
        });
      }
    } else if (error.code === 'ECONNABORTED') {
      // Handle timeout errors specifically
      console.log('Request timeout occurred');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;