import express from "express";

import {
  getMedicationsForPatient,
  createMedication,
  updateMedication,
  deleteMedication,
  getTodaysMedicationSchedule,
  markMedicationTaken,
  getMedicationHistory,
} from "../controllers/medication.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/* ============================================================
   ALL MEDICATION ROUTES REQUIRE:
   - Valid JWT
   - Caregiver role

   Ownership of the patient is verified inside every controller
   through CareAssignment before any read/write happens.
============================================================ */

router.use(protect, authorizeRoles("caregiver"));

/* ============================================================
   CREATE MEDICATION
============================================================ */

router.post("/", createMedication);

/* ============================================================
   GET MEDICATIONS FOR A PATIENT
============================================================ */

router.get("/patient/:patientId", getMedicationsForPatient);

/* ============================================================
   GET TODAY'S MEDICATION SCHEDULE FOR A PATIENT
   IMPORTANT: keep before nothing conflicting — distinct path
============================================================ */

router.get(
  "/patient/:patientId/today",
  getTodaysMedicationSchedule
);

/* ============================================================
   GET MEDICATION HISTORY FOR A PATIENT
============================================================ */

router.get(
  "/patient/:patientId/history",
  getMedicationHistory
);

/* ============================================================
   UPDATE MEDICATION
============================================================ */

router.put("/:medicationId", updateMedication);

/* ============================================================
   MARK MEDICATION DOSE AS TAKEN
============================================================ */

router.patch("/:medicationId/take", markMedicationTaken);

/* ============================================================
   DELETE MEDICATION
============================================================ */

router.delete("/:medicationId", deleteMedication);

export default router;
