import express from "express";

import {
  registerPatient,
  registerCaregiver,
  login,
} from "../controllers/auth.controller.js";

import upload from "../middleware/upload.middleware.js";

const router = express.Router();

/* ============================================================
   LOGIN
============================================================ */

router.post(
  "/login",
  login
);

/* ============================================================
   PATIENT REGISTRATION
============================================================ */

router.post(
  "/register/patient",
  upload.single("profilePicture"),
  registerPatient
);

/* ============================================================
   CAREGIVER REGISTRATION
============================================================ */

router.post(
  "/register/caregiver",
  upload.single("profilePicture"),
  registerCaregiver
);

export default router;