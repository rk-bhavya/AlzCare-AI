import axiosInstance from "./axiosInstance.js";

/* ============================================================
   GET MEDICATIONS FOR A PATIENT
============================================================ */

export const getMedicationsForPatient = async (patientId) => {
  const response = await axiosInstance.get(
    `/medications/patient/${patientId}`
  );
  return response.data;
};

/* ============================================================
   GET TODAY'S MEDICATION SCHEDULE FOR A PATIENT
============================================================ */

export const getTodaysMedicationSchedule = async (patientId) => {
  const response = await axiosInstance.get(
    `/medications/patient/${patientId}/today`
  );
  return response.data;
};

/* ============================================================
   GET MEDICATION HISTORY FOR A PATIENT
============================================================ */

export const getMedicationHistory = async (patientId) => {
  const response = await axiosInstance.get(
    `/medications/patient/${patientId}/history`
  );
  return response.data;
};

/* ============================================================
   CREATE MEDICATION
============================================================ */

export const createMedication = async (medicationData) => {
  const response = await axiosInstance.post(
    "/medications",
    medicationData
  );
  return response.data;
};

/* ============================================================
   UPDATE MEDICATION
============================================================ */

export const updateMedication = async (medicationId, medicationData) => {
  const response = await axiosInstance.put(
    `/medications/${medicationId}`,
    medicationData
  );
  return response.data;
};

/* ============================================================
   DELETE MEDICATION
============================================================ */

export const deleteMedication = async (medicationId) => {
  const response = await axiosInstance.delete(
    `/medications/${medicationId}`
  );
  return response.data;
};

/* ============================================================
   MARK MEDICATION DOSE AS TAKEN
============================================================ */

export const markMedicationTaken = async (medicationId, time, date) => {
  const response = await axiosInstance.patch(
    `/medications/${medicationId}/take`,
    { time, date }
  );
  return response.data;
};
