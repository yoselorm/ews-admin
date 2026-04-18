import axios from 'axios';
import { api_url } from '../utils/config';

const api = axios.create({
  baseURL: api_url,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle Global Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is expired or invalid
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_data');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;