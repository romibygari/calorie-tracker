import axios from 'axios';
import Constants from 'expo-constants';

// During development, use your local IP: e.g. http://192.168.1.x:3000
// For production APK, set this to your Render URL in app.json extra.apiBaseUrl
const BASE_URL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ?? 'http://localhost:3000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
