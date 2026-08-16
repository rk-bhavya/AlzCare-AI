import axiosInstance from "./axiosinstance.js";


/* ============================================================
   CREATE AI ASSESSMENT
============================================================ */

export const createAssessment = async (
  patientId,
  imageFile,
  notes = ""
) => {

  const formData =
    new FormData();


  formData.append(
    "patientId",
    patientId
  );


  formData.append(
    "image",
    imageFile
  );


  if (notes.trim()) {

    formData.append(
      "notes",
      notes.trim()
    );

  }


  const response =
    await axiosInstance.post(
      "/assessments",
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
   GET PATIENT ASSESSMENT HISTORY
============================================================ */

export const getPatientAssessments =
  async (
    patientId
  ) => {

    const response =
      await axiosInstance.get(
        `/assessments/patient/${patientId}`
      );

    return response.data;

  };


/* ============================================================
   GET LATEST DOCTOR ASSESSMENT
============================================================ */

export const getLatestDoctorAssessment =
  async () => {

    const response =
      await axiosInstance.get(
        "/assessments/latest"
      );

    return response.data;

  };


/* ============================================================
   GET DOCTOR ASSESSMENT COUNT
============================================================ */

export const getDoctorAssessmentCount =
  async () => {

    const response =
      await axiosInstance.get(
        "/assessments/count"
      );

    return response.data;

  };


/* ============================================================
   GET DOCTOR PATIENTS NEEDING ATTENTION
============================================================ */

export const getDoctorPatientsNeedingAttention =
  async () => {

    const response =
      await axiosInstance.get(
        "/assessments/needs-attention"
      );

    return response.data;

  };


/* ============================================================
   GET ALL DOCTOR AI REPORTS

   Used by:
   Doctor → AI Reports
============================================================ */

export const getDoctorAssessments =
  async () => {

    const response =
      await axiosInstance.get(
        "/assessments/doctor"
      );

    return response.data;

  };