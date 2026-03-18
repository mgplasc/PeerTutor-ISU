import axios from 'axios';

// Android emulator uses 10.0.2.2 to reach your computer's localhost
// If using iOS simulator change this to: http://localhost:8080
// If using a physical device change this to your computer's local IP address
const BASE_URL = 'http://localhost:8080';
//'http://10.0.2.2:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

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
