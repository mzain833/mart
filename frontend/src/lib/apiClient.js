
import axios from "axios";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/v1",

  withCredentials: true,
  timeout: 15000,

  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      config.headers.delete?.("Content-Type");

      if (!config.headers.delete) {
        delete config.headers["Content-Type"];
      }
    } else if (config.data && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
