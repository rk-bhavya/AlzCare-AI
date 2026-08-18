import axiosInstance from "./axiosInstance.js";


/* ============================================================
   CAREGIVER: GET ASSIGNED DOCTOR(S)
============================================================ */

export const getCaregiverDoctors =
  async () => {

    const response =
      await axiosInstance.get(
        "/messages/doctors"
      );

    return response.data;
  };


/* ============================================================
   CAREGIVER: GET CONVERSATION WITH A DOCTOR
============================================================ */

export const getCaregiverConversation =
  async (
    doctorId
  ) => {

    const response =
      await axiosInstance.get(
        `/messages/conversation/doctor/${doctorId}`
      );

    return response.data;
  };


/* ============================================================
   GET CAREGIVERS
============================================================ */

export const getDoctorCaregivers =
  async () => {

    const response =
      await axiosInstance.get(
        "/messages/caregivers"
      );

    return response.data;
  };


/* ============================================================
   GET CONVERSATION
============================================================ */

export const getConversation =
  async (caregiverId) => {

    const response =
      await axiosInstance.get(
        `/messages/conversation/${caregiverId}`
      );

    return response.data;
  };


/* ============================================================
   SEND MESSAGE
============================================================ */

export const sendMessage =
  async (
    receiverId,
    text,
    patientId = null
  ) => {

    const response =
      await axiosInstance.post(
        "/messages",
        {
          receiverId,
          text,
          patientId,
        }
      );

    return response.data;
  };