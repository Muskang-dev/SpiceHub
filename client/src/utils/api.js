import axios from 'axios';

// In dev, CRA's "proxy" field in package.json forwards /api to localhost:5000.
// In production, set REACT_APP_API_URL to your deployed backend's base URL
// (e.g. https://spicehub-api.onrender.com/api) if the frontend and backend
// are hosted on different domains. Falls back to relative '/api' when the
// frontend is served from the same origin as the backend.
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('spicehub_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Handle 401 - smooth redirect with message
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('spicehub_token');
      localStorage.removeItem('spicehub_user');
      // Store message so Login page can show a friendly toast
      localStorage.setItem('spicehub_redirect_msg', 'Please log in to continue.');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
