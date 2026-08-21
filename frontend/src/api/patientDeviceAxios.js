import axios from "axios";

import { API_BASE_URL } from "../config/constants.js";
import {
  getDeviceToken,
  clearDeviceToken,
} from "../utils/patientDeviceStorage.js";

/* ============================================================
   PATIENT DEVICE AXIOS INSTANCE

   A SEPARATE axios instance for Patient Device requests. This
   is intentionally isolated from the normal `axiosInstance`
   (which always attaches the caregiver/doctor/patient JWT from
   STORAGE_KEYS.TOKEN whenever one exists in localStorage).

   Mixing the two would be a real security risk: if a caregiver
   happens to be logged in on the same browser/tablet used for
   patient-device testing, the normal instance would silently
   attach their JWT to what should be an unauthenticated /
   device-token-only request. This instance NEVER reads or sends
   that JWT — only the device token, via the `x-device-token`
   header that the backend's protectPatientDevice middleware
   expects.
============================================================ */

const patientDeviceAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

patientDeviceAxios.interceptors.request.use(
  (config) => {
    const deviceToken = getDeviceToken();

    if (deviceToken) {
      config.headers["x-device-token"] = deviceToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
 * On a 401 (invalid/revoked device token), clear the stored
 * token immediately so the app's routing guard can send the
 * device back to the pairing page. We don't redirect directly
 * here — that's a page/router concern — we just make sure a
 * dead token is never reused for the next request.
 */
patientDeviceAxios.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      clearDeviceToken();
    }

    return Promise.reject(error);
  }
);

export default patientDeviceAxios;
