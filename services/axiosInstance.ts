import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.86.150:8080/nesugo',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
