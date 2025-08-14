// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Utilise le proxy Vite
  withCredentials: true, // ⚠️ important pour l'envoi des cookies
});

export default api;
