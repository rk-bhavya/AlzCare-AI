import axiosInstance from "./axiosInstance.js";

/* ============================================================
   GET DAILY TASKS FOR A PATIENT
============================================================ */

export const getPatientDailyTasks = async (patientId) => {
  const response = await axiosInstance.get(
    `/daily-tasks/patient/${patientId}`
  );
  return response.data;
};

/* ============================================================
   CREATE DAILY TASK
============================================================ */

export const createDailyTask = async (taskData) => {
  const response = await axiosInstance.post("/daily-tasks", taskData);
  return response.data;
};

/* ============================================================
   UPDATE DAILY TASK
============================================================ */

export const updateDailyTask = async (taskId, taskData) => {
  const response = await axiosInstance.put(
    `/daily-tasks/${taskId}`,
    taskData
  );
  return response.data;
};

/* ============================================================
   MARK DAILY TASK COMPLETED / PENDING
============================================================ */

export const completeDailyTask = async (taskId, completed = true) => {
  const response = await axiosInstance.patch(
    `/daily-tasks/${taskId}/complete`,
    { completed }
  );
  return response.data;
};

/* ============================================================
   DELETE DAILY TASK
============================================================ */

export const deleteDailyTask = async (taskId) => {
  const response = await axiosInstance.delete(`/daily-tasks/${taskId}`);
  return response.data;
};
