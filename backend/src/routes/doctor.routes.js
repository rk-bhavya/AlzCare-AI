import express from "express";

import {
  getDoctorProfile,
  updateDoctorProfile,
  getPatientsForAssignment,
  getCaregiversForAssignment,
  assignPatientToCaregiver,
} from "../controllers/doctor.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";


const router = express.Router();


/* ============================================================
   ALL DOCTOR ROUTES REQUIRE:
   - Valid JWT
   - Doctor role
============================================================ */

router.use(
  protect,
  authorizeRoles("doctor")
);


/* ============================================================
   DOCTOR PROFILE
============================================================ */

router.get(
  "/profile",
  getDoctorProfile
);


router.put(
  "/profile",
  updateDoctorProfile
);


/* ============================================================
   GET PATIENTS
============================================================ */

router.get(
  "/patients",
  getPatientsForAssignment
);


/* ============================================================
   GET CAREGIVERS
============================================================ */

router.get(
  "/caregivers",
  getCaregiversForAssignment
);


/* ============================================================
   ASSIGN PATIENT
============================================================ */

router.post(
  "/assign-patient",
  assignPatientToCaregiver
);


export default router;