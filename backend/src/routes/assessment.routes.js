import express from "express";

import {
  createAssessment,
  getPatientAssessments,
  getLatestDoctorAssessment,
  getDoctorAssessmentCount,
  getDoctorPatientsNeedingAttention,
  getDoctorAssessments,
} from "../controllers/assessment.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import upload from "../middleware/upload.middleware.js";


const router =
  express.Router();


/* ============================================================
   CREATE AI ASSESSMENT

   Doctor:
   - selects patient
   - uploads MRI/CT image

   Caregiver:
   - selects assigned patient
   - uploads MRI/CT image
============================================================ */

router.post(
  "/",
  protect,
  authorizeRoles(
    "doctor",
    "caregiver"
  ),
  upload.single("image"),
  createAssessment
);


/* ============================================================
   GET DOCTOR ASSESSMENT COUNT
============================================================ */

router.get(
  "/count",
  protect,
  authorizeRoles("doctor"),
  getDoctorAssessmentCount
);


/* ============================================================
   GET LATEST DOCTOR ASSESSMENT
============================================================ */

router.get(
  "/latest",
  protect,
  authorizeRoles("doctor"),
  getLatestDoctorAssessment
);


/* ============================================================
   GET PATIENTS NEEDING ATTENTION
============================================================ */

router.get(
  "/needs-attention",
  protect,
  authorizeRoles("doctor"),
  getDoctorPatientsNeedingAttention
);


/* ============================================================
   GET ALL DOCTOR AI REPORTS

   Used by:

   /doctor/ai-reports
============================================================ */

router.get(
  "/doctor",
  protect,
  authorizeRoles("doctor"),
  getDoctorAssessments
);


/* ============================================================
   GET PATIENT ASSESSMENT HISTORY

   Doctor:
   - Can view assessments for assigned patient

   Caregiver:
   - Can view assessments for assigned patient
============================================================ */

router.get(
  "/patient/:patientId",
  protect,
  authorizeRoles(
    "doctor",
    "caregiver"
  ),
  getPatientAssessments
);


/* ============================================================
   EXPORT
============================================================ */

export default router;