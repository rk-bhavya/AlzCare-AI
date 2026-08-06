import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../config/constants.js";

/**
 * Single pre-configured Axios instance used by every API module.
 * Benefits: one base URL, automatic auth header, uniform error shape.
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ------------------------------------------------------------------
   REQUEST INTERCEPTOR — attach the JWT (used from Feature 2 onwards)
------------------------------------------------------------------ */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ------------------------------------------------------------------
   RESPONSE INTERCEPTOR — normalise every error into one object
------------------------------------------------------------------ */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Server responded with 4xx / 5xx
    if (error.response) {
      const { status, data } = error.response;

      return Promise.reject({
        status,
        message: data?.message || "Request failed. Please try again.",
        errors: data?.errors || [],
      });
    }

    // Request sent but no response (backend down / CORS / timeout)
    if (error.request) {
      return Promise.reject({
        status: 0,
        message:
          "Unable to reach the server. Please check that the backend is running.",
        errors: [],
      });
    }

    // Something broke while building the request
    return Promise.reject({
      status: -1,
      message: error.message || "Unexpected error occurred.",
      errors: [],
    });
  }
);

export default axiosInstance;
