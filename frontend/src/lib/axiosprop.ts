import axios from "axios";
import i18next from "i18next";

const axiosprop = axios.create({
  // baseURL: "https://your-server.example.com",
  baseURL: "http://localhost:5601",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token and language dynamically before every request
axiosprop.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("Authorization");
      if (token) {
        config.headers.Authorization = `${token}`;
      }
    }

    // Attach current language for i18n-aware backend responses
    config.headers['Accept-Language'] =
      (typeof i18next !== 'undefined' && i18next.language) || 'en';

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosprop;
