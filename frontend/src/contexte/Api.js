// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true, // ⚠️ important pour l'envoi des cookies
});

export default api;
