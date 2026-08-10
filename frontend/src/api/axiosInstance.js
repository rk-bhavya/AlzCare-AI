import axios from "axios";

import {
  API_BASE_URL,
  STORAGE_KEYS,
} from "../config/constants.js";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

/* ============================================================
   REQUEST INTERCEPTOR
   Automatically attach JWT
============================================================ */

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      STORAGE_KEYS.TOKEN
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================================================
   RESPONSE INTERCEPTOR
============================================================ */

axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      /*
       * We don't automatically redirect here.
       * Individual pages can decide what to do.
       */
      console.warn(
        "Authentication required or token is invalid."
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;