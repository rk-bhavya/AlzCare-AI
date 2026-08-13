import express from "express";

import {
  registerPatient,
  registerCaregiver,
  registerDoctor,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
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

/* ============================================================
   DOCTOR REGISTRATION
============================================================ */

router.post(
  "/register/doctor",
  upload.single("profilePicture"),
  registerDoctor
);

/* ============================================================
   FORGOT PASSWORD
============================================================ */

router.post(
  "/forgot-password",
  forgotPassword
);

/* ============================================================
   VERIFY OTP
============================================================ */

router.post(
  "/verify-otp",
  verifyOTP
);

/* ============================================================
   RESET PASSWORD
============================================================ */

router.post(
  "/reset-password",
  resetPassword
);

export default router;