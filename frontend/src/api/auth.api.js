import axiosInstance from "./axiosinstance.js";

export const registerPatient = async (formData) => {
  const response = await axiosInstance.post(
    "/auth/register/patient",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const registerCaregiver = async (formData) => {
  const response = await axiosInstance.post(
    "/auth/register/caregiver",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};