/**
 * Application-wide constants.
 * Using these instead of hard-coded strings prevents typo bugs
 * and makes refactoring safe.
 */

export const APP_NAME =
  import.meta.env.VITE_APP_NAME || "NeuroCare AI";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

/** The four modules of the system */
export const ROLES = {
  PATIENT: "patient",
  CAREGIVER: "caregiver",
  DOCTOR: "doctor",
  ADMIN: "admin",
};

/** Centralised route paths */
export const ROUTES = {
  HOME: "/",

  // Public Routes
  LOGIN: "/landing",
  REGISTER: "/register",

  // Authentication Pages
  DOCTOR_LOGIN: "/doctor-login",
  CAREGIVER_LOGIN: "/caregiver-login",

  PATIENT_DASHBOARD: "/patient/dashboard",
  CAREGIVER_DASHBOARD: "/caregiver/dashboard",
  DOCTOR_DASHBOARD: "/doctor/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",

  PATIENT_REGISTER: "/patient-register",
  CAREGIVER_REGISTER: "/caregiver-register",
  DOCTOR_REGISTER: "/doctor-register",

  // Patient Device (foundation only — no dashboard yet)
  PATIENT_DEVICE_PAIR: "/patient-device/pair",
  PATIENT_DEVICE_DASHBOARD: "/patient-device",

  // Fallback
  NOT_FOUND: "*",
};

/** localStorage keys */
export const STORAGE_KEYS = {
  TOKEN: "nc_access_token",
  USER: "nc_user",

  /*
   * Separate storage for the Patient Device token. This is a
   * DIFFERENT authentication mechanism from normal user login
   * (see backend protectPatientDevice middleware) and must
   * never be mixed with the caregiver/doctor/patient JWT above.
   */
  PATIENT_DEVICE_TOKEN: "nc_patient_device_token",
};