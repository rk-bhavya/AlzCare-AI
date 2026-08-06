/**
 * Application-wide constants.
 * Using these instead of hard-coded strings prevents typo bugs
 * and makes refactoring safe.
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || "NeuroCare AI";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

/** The four modules of the system */
export const ROLES = {
  PATIENT: "patient",
  CAREGIVER: "caregiver",
  DOCTOR: "doctor",
  ADMIN: "admin",
};

/** Centralised route paths — used by AppRoutes and every <Link> */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PATIENT_DASHBOARD: "/patient/dashboard",
  CAREGIVER_DASHBOARD: "/caregiver/dashboard",
  DOCTOR_DASHBOARD: "/doctor/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",
  NOT_FOUND: "*",
};

/** localStorage keys */
export const STORAGE_KEYS = {
  TOKEN: "nc_access_token",
  USER: "nc_user",
};
