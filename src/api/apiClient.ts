// src/api/apiClient.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:9090/api",
  timeout: 8000,
});

// ✅ inyecta token en cada request
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth");
  if (raw) {
    try {
      const auth = JSON.parse(raw);
      const token = auth?.token;
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
  }
  
  // Log para debugging
  console.log("🔵 REQUEST:", {
    method: config.method?.toUpperCase(),
    url: config.url,
    data: config.data ? JSON.parse(typeof config.data === 'string' ? config.data : JSON.stringify(config.data)) : null,
    headers: {
      Authorization: config.headers?.Authorization ? String(config.headers.Authorization).substring(0, 20) + '...' : 'none',
      'Content-Type': config.headers?.['Content-Type'],
    },
  });
  
  return config;
});

// ✅ Log errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔴 ERROR RESPONSE:", {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      sentData: error.config?.data ? JSON.parse(error.config.data) : null,
      responseData: error.response?.data,
      responseMessage: error.response?.data?.message || error.response?.data?.error,
    });
    return Promise.reject(error);
  }
);

export default api;
