import axios from "axios";
import testToken from "./testToken";
import { logout } from "./AuthContext";

const api = axios.create({
    baseURL: "/api", // Adapte l'URL selon ton backend
});

api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem("token");

    if (token) {
        await testToken(token, logout); // Vérifie le token avant la requête
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
