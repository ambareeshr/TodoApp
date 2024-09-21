import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getTodos = () => api.get('/todos');
export const addTodo = (title) => api.post('/todos', { title });
export const updateTodo = (id, updates) => api.put(`/todos/${id}`, updates);
export const deleteTodo = (id) => api.delete(`/todos/${id}`);

export const login = (email, password) => api.post('/users/login', { email, password });
export const register = (name, email, password) => api.post('/users/register', { name, email, password });
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (updates) => api.put('/users/profile', updates);

export default api;
