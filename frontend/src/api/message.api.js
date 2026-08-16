import axiosInstance from "./axiosinstance.js";


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