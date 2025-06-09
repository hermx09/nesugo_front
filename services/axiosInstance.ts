import axios from 'axios';

const api = axios.create({
  baseURL: 'https://70bf-92-203-229-249.ngrok-free.app/nesugo',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
