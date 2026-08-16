import express from "express";

import {
  createClinicalNote,
  getPatientClinicalNotes,
} from "../controllers/clinicalNote.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";


const router = express.Router();


/* ============================================================
   ALL CLINICAL NOTE ROUTES
============================================================ */

router.use(
  protect,
  authorizeRoles("doctor")
);


/* ============================================================
   CREATE NOTE
============================================================ */

router.post(
  "/",
  createClinicalNote
);


/* ============================================================
   GET PATIENT NOTES
============================================================ */

router.get(
  "/patient/:patientId",
  getPatientClinicalNotes
);


export default router;