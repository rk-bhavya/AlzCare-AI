import axiosInstance from "./axiosinstance.js";


/* ============================================================
   GET DOCTOR PROFILE
============================================================ */

export const getDoctorProfile =
  async () => {

    const response =
      await axiosInstance.get(
        "/doctor/profile"
      );

    return response.data;
  };


/* ============================================================
   UPDATE DOCTOR PROFILE
============================================================ */

export const updateDoctorProfile =
  async (profileData) => {

    const response =
      await axiosInstance.put(
        "/doctor/profile",
        profileData
      );

    return response.data;
  };