import axiosInstance from "./axiosInstance.js";

/* ============================================================
   GET CAREGIVER DASHBOARD (single active patient/doctor)
============================================================ */

export const getCaregiverDashboard = async () => {
  const response = await axiosInstance.get("/caregiver/dashboard");
  return response.data;
};

/* ============================================================
   GET CAREGIVER DASHBOARD SUMMARY
   (summary cards, today's meds/appts, recent alerts)
============================================================ */

export const getCaregiverDashboardSummary = async () => {
  const response = await axiosInstance.get(
    "/caregiver/dashboard/summary"
  );
  return response.data;
};

/* ============================================================
   GET ALL ASSIGNED PATIENTS
============================================================ */

export const getCaregiverPatients = async () => {
  const response = await axiosInstance.get("/caregiver/patients");
  return response.data;
};

/* ============================================================
   GET SINGLE PATIENT DETAILS
============================================================ */

export const getCaregiverPatientDetails = async (patientId) => {
  const response = await axiosInstance.get(
    `/caregiver/patients/${patientId}`
  );
  return response.data;
};

/* ============================================================
   GET PATIENT MONITORING
============================================================ */

export const getCaregiverMonitoring = async () => {
  const response = await axiosInstance.get("/caregiver/monitoring");
  return response.data;
};

/* ============================================================
   GET / UPDATE CAREGIVER PROFILE
============================================================ */

export const getCaregiverProfile = async () => {
  const response = await axiosInstance.get("/caregiver/profile");
  return response.data;
};

export const updateCaregiverProfile = async (profileData) => {
  const response = await axiosInstance.put(
    "/caregiver/profile",
    profileData
  );
  return response.data;
};
