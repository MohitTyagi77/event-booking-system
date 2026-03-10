import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
});

export const adminHeaders = () => ({
  headers: {
    'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY || ''
  }
});

export default api;
