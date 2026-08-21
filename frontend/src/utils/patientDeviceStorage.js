import { STORAGE_KEYS } from "../config/constants.js";

/* ============================================================
   PATIENT DEVICE TOKEN STORAGE

   The Patient Device authenticates itself using a device token
   instead of a normal user login (see backend
   protectPatientDevice middleware). This is intentionally kept
   completely separate from STORAGE_KEYS.TOKEN, which holds the
   caregiver/doctor/patient JWT.

   All device-token localStorage access should go through these
   helpers rather than being scattered across components.
============================================================ */

export const saveDeviceToken = (token) => {
  if (!token) return;
  localStorage.setItem(STORAGE_KEYS.PATIENT_DEVICE_TOKEN, token);
};

export const getDeviceToken = () =>
  localStorage.getItem(STORAGE_KEYS.PATIENT_DEVICE_TOKEN);

export const clearDeviceToken = () => {
  localStorage.removeItem(STORAGE_KEYS.PATIENT_DEVICE_TOKEN);
};

export const hasDeviceToken = () => Boolean(getDeviceToken());
