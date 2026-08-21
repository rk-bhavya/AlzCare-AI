import axiosInstance from "./axiosInstance.js";

/* ============================================================
   GET FAMILY MEMBERS FOR A PATIENT
============================================================ */

export const getFamilyMembersForPatient = async (patientId) => {
  const response = await axiosInstance.get(
    `/family-members/patient/${patientId}`
  );
  return response.data;
};

/* ============================================================
   CREATE FAMILY MEMBER
   Accepts either a plain object (no photo) or a FormData
   instance (when a photo file is included).
============================================================ */

export const createFamilyMember = async (payload) => {
  const isFormData =
    typeof FormData !== "undefined" && payload instanceof FormData;

  const response = await axiosInstance.post(
    "/family-members",
    payload,
    isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined
  );

  return response.data;
};

/* ============================================================
   DELETE FAMILY MEMBER
============================================================ */

export const deleteFamilyMember = async (familyMemberId) => {
  const response = await axiosInstance.delete(
    `/family-members/${familyMemberId}`
  );
  return response.data;
};
