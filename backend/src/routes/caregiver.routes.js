import express from "express";

import {
  getCaregiverDashboard,
  getCaregiverPatients,
  getCaregiverPatientDetails,
  getCaregiverDashboardSummary,
  getCaregiverProfile,
  updateCaregiverProfile,
  getCaregiverMonitoring,
} from "../controllers/caregiver.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/* ============================================================
   ALL CAREGIVER ROUTES REQUIRE:
   - Valid JWT
   - Caregiver role

   Every controller behind this line uses req.user._id and
   verifies patient ownership through CareAssignment. Nothing
   here ever trusts an ID sent from the frontend.
============================================================ */

router.use(protect, authorizeRoles("caregiver"));

/* ============================================================
   DASHBOARD (existing — single active patient/doctor snapshot)
============================================================ */

router.get("/dashboard", getCaregiverDashboard);

/* ============================================================
   DASHBOARD SUMMARY (new — summary cards, today's meds/appts,
   recent alerts, across every assigned patient)
============================================================ */

router.get("/dashboard/summary", getCaregiverDashboardSummary);

/* ============================================================
   MY PATIENTS
============================================================ */

router.get("/patients", getCaregiverPatients);

router.get("/patients/:patientId", getCaregiverPatientDetails);

/* ============================================================
   PATIENT MONITORING
============================================================ */

router.get("/monitoring", getCaregiverMonitoring);

/* ============================================================
   CAREGIVER PROFILE
============================================================ */

router.get("/profile", getCaregiverProfile);

router.put("/profile", updateCaregiverProfile);

export default router;
