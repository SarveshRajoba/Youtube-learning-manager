import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle authentication errors and token storage
api.interceptors.response.use(
    (response) => {
        // Store JWT token from response if present
        if (response.data?.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response;
    },
    (error) => {
        console.error("🚨 API Error:", error.response?.status, error.response?.data);
        // Handle 401 errors (unauthorized) - redirect to login
        if (error.response?.status === 401) {
            console.log("🔒 401 Unauthorized - redirecting to login");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;