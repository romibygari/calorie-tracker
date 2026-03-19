import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://calorie-tracker-dyi5.onrender.com';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
