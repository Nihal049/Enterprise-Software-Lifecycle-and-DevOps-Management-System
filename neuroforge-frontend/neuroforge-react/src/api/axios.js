import axios from 'axios';

// Set this to your Spring Boot port (usually 8080)
const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  }
});

// Axios Interceptor: Automatically attach the JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token'); // Match this key to what your Login page sets
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;