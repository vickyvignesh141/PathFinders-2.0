
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the currently logged-in user's token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Don't attach an old token to login/register requests
    const isAuthRequest = config.url?.includes("/auth/");

    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
