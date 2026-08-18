import axiosInstance from "./axiosInstance.js";

/* ============================================================
   PATIENT REGISTRATION
============================================================ */

export const registerPatient = async (
  formData
) => {
  const response =
    await axiosInstance.post(
      "/auth/register/patient",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
};

/* ============================================================
   CAREGIVER REGISTRATION
============================================================ */

export const registerCaregiver = async (
  formData
) => {
  const response =
    await axiosInstance.post(
      "/auth/register/caregiver",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
};

/* ============================================================
   DOCTOR REGISTRATION
============================================================ */

export const registerDoctor = async (
  formData
) => {
  const response =
    await axiosInstance.post(
      "/auth/register/doctor",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
};

/* ============================================================
   LOGIN
============================================================ */

export const loginUser = async (
  credentials
) => {
  const response =
    await axiosInstance.post(
      "/auth/login",
      credentials
    );

  return response.data;
};

/* ============================================================
   LOGOUT
============================================================ */

export const logoutUser = () => {
  localStorage.removeItem(
    "nc_access_token"
  );

  localStorage.removeItem(
    "nc_user"
  );
};