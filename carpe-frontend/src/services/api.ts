import axios from 'axios';

const api = axios.create({
  baseURL: 'https://carpediem.visionrs.com.ar/api',
  //baseURL: 'http://localhost:3000/api',
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      const mensaje = error.response?.data?.error || '';
      if (mensaje.includes('cuota')) {
        window.location.href = '/cuota-vencida';
      }
    }
    return Promise.reject(error);
  }
);

export default api;