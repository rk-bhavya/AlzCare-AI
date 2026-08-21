import axiosInstance from "./axiosInstance.js";
import patientDeviceAxios from "./patientDeviceAxios.js";

/* ============================================================
   CAREGIVER-AUTHENTICATED (normal JWT via axiosInstance)
============================================================ */

export const getPatientDeviceStatus = async (patientId) => {
  const response = await axiosInstance.get(
    `/patient-devices/patient/${patientId}`
  );
  return response.data;
};

export const setupPatientDevice = async (patientId, deviceName) => {
  const response = await axiosInstance.post(
    `/patient-devices/patient/${patientId}/setup`,
    deviceName ? { deviceName } : {}
  );
  return response.data;
};

export const regeneratePatientDevice = async (patientId) => {
  const response = await axiosInstance.post(
    `/patient-devices/patient/${patientId}/regenerate`
  );
  return response.data;
};

export const revokePatientDevice = async (patientId) => {
  const response = await axiosInstance.delete(
    `/patient-devices/patient/${patientId}`
  );
  return response.data;
};

/* ============================================================
   DEVICE-FACING (device token via the dedicated
   patientDeviceAxios instance — never the caregiver/doctor JWT)
============================================================ */

export const redeemPairingCode = async (pairingCode, deviceName) => {
  const response = await patientDeviceAxios.post("/patient-devices/redeem", {
    pairingCode,
    ...(deviceName ? { deviceName } : {}),
  });
  return response.data;
};

export const getPatientDeviceSession = async () => {
  const response = await patientDeviceAxios.get("/patient-devices/session");
  return response.data;
};

export const getMyProfile = async () => {
  const response = await patientDeviceAxios.get("/patient-devices/me");
  return response.data;
};

export const getMyTodaysMedications = async () => {
  const response = await patientDeviceAxios.get(
    "/patient-devices/me/medications/today"
  );
  return response.data;
};

export const markMyMedicationTaken = async (medicationId, time) => {
  const response = await patientDeviceAxios.patch(
    `/patient-devices/me/medications/${medicationId}/take`,
    { time }
  );
  return response.data;
};

export const getMyDailyTasks = async () => {
  const response = await patientDeviceAxios.get(
    "/patient-devices/me/daily-tasks"
  );
  return response.data;
};

export const completeMyDailyTask = async (taskId, completed = true) => {
  const response = await patientDeviceAxios.patch(
    `/patient-devices/me/daily-tasks/${taskId}/complete`,
    { completed }
  );
  return response.data;
};

export const createMyCognitiveActivity = async (activityData) => {
  const response = await patientDeviceAxios.post(
    "/patient-devices/me/cognitive-activities",
    activityData
  );
  return response.data;
};

export const getMyCognitiveActivityToday = async () => {
  const response = await patientDeviceAxios.get(
    "/patient-devices/me/cognitive-activities/today"
  );
  return response.data;
};

export const requestHelp = async () => {
  const response = await patientDeviceAxios.post("/patient-devices/me/help");
  return response.data;
};

export const updateMyLocation = async (latitude, longitude) => {
  const response = await patientDeviceAxios.post(
    "/patient-devices/me/location",
    { latitude, longitude }
  );
  return response.data;
};

export const recognizeFamilyMember = async (image) => {
  const formData = new FormData();
  formData.append("image", image, "face-capture.jpg");
  const response = await patientDeviceAxios.post("/patient-devices/face-recognition", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
