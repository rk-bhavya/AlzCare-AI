import axiosInstance from "./axiosInstance.js";

/* ============================================================
   SAVE A COMPLETED COGNITIVE ACTIVITY RESULT
============================================================ */

export const createCognitiveActivity = async (activityData) => {
  const response = await axiosInstance.post(
    "/cognitive",
    activityData
  );
  return response.data;
};

/* ============================================================
   GET COGNITIVE ACTIVITY HISTORY / PROGRESS FOR A PATIENT
============================================================ */

export const getCognitiveHistory = async (patientId) => {
  const response = await axiosInstance.get(
    `/cognitive/patient/${patientId}`
  );
  return response.data;
};
