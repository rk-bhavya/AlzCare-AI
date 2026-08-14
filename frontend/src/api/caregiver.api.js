import axiosInstance from "./axiosinstance.js";

/* ============================================================
   GET CAREGIVER DASHBOARD
============================================================ */

export const getCaregiverDashboard = async () => {
  const response =
    await axiosInstance.get(
      "/caregiver/dashboard"
    );

  return response.data;
};