import axios from 'axios';

// Cliente HTTP configurado por defecto a http://localhost:3000/api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para inyectar token JWT en las cabeceras
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para capturar respuestas y expiración de sesión
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Si el 401 no proviene de la ruta de login, limpiar sesión
      const isLoginUrl = error.config?.url?.includes('/auth/login');
      if (!isLoginUrl) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Notificar o redirigir a login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    console.error('Error en la llamada a la API:', error?.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default apiClient;
