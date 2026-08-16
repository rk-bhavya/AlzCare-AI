import axiosInstance from "./axiosinstance.js";


/* ============================================================
   CREATE APPOINTMENT
============================================================ */

export const createAppointment = async (
  appointmentData
) => {

  const response =
    await axiosInstance.post(
      "/appointments",
      appointmentData
    );

  return response.data;
};


/* ============================================================
   GET DOCTOR'S UPCOMING APPOINTMENTS
============================================================ */

export const getDoctorAppointments =
  async () => {

    const response =
      await axiosInstance.get(
        "/appointments"
      );

    return response.data;
  };


/* ============================================================
   GET TODAY'S APPOINTMENTS
============================================================ */

export const getTodaysAppointments =
  async () => {

    const response =
      await axiosInstance.get(
        "/appointments/today"
      );

    return response.data;
  };


/* ============================================================
   UPDATE APPOINTMENT STATUS
============================================================ */

export const updateAppointmentStatus =
  async (
    appointmentId,
    status
  ) => {

    const response =
      await axiosInstance.patch(
        `/appointments/${appointmentId}/status`,
        {
          status,
        }
      );

    return response.data;
  };