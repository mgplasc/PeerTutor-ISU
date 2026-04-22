import axios from 'axios';

// Android emulator uses 10.0.2.2 to reach your computer's localhost
// If using iOS simulator change this to: http://localhost:8080
// If using a physical device change this to your computer's local IP address
const BASE_URL =
//'http://localhost:8080'; // iOS simulator
'http://10.0.2.2:8080'; // Android emulator

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Store token in memory so the interceptor can access it
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// Attach JWT token to every request if available
api.interceptors.request.use(
  function(config) {
    if (authToken !== null) {
      config.headers['Authorization'] = 'Bearer ' + authToken;
    }
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    if (error.response) {
      console.error('API Error ' + error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response from server. Is the backend running on port 8080?');
    } else {
      console.error('Request error: ' + error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
