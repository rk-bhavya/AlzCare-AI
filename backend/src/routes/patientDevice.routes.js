import express from "express";

import {
  setupPatientDevice,
  regeneratePatientDevice,
  getPatientDeviceStatus,
  revokePatientDevice,
  redeemPairingCode,
  getPatientDeviceSession,
  getMyProfile,
  getMyTodaysMedications,
  markMyMedicationTaken,
  getMyDailyTasks,
  completeMyDailyTask,
  createMyCognitiveActivity,
  getMyCognitiveActivityToday,
  requestHelp,
  updateMyLocation,
  recognizeMyFamilyMember,
} from "../controllers/patientDevice.controller.js";

import {
  protect,
  authorizeRoles,
  protectPatientDevice,
} from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

/* ============================================================
   CAREGIVER-AUTHENTICATED ROUTES

   Every operation verifies protect + authorizeRoles("caregiver")
   + CareAssignment ownership inside the controller. A caregiver
   can never manage a device for a patient who isn't assigned to
   them.
============================================================ */

router.post(
  "/patient/:patientId/setup",
  protect,
  authorizeRoles("caregiver"),
  setupPatientDevice
);

router.post(
  "/patient/:patientId/regenerate",
  protect,
  authorizeRoles("caregiver"),
  regeneratePatientDevice
);

router.get(
  "/patient/:patientId",
  protect,
  authorizeRoles("caregiver"),
  getPatientDeviceStatus
);

router.delete(
  "/patient/:patientId",
  protect,
  authorizeRoles("caregiver"),
  revokePatientDevice
);

/* ============================================================
   DEVICE-FACING ROUTES — PAIRING

   `redeem` is intentionally PUBLIC — the patient device has no
   prior credentials. Security comes from the pairing code
   itself (random, short-lived, single-use), never from a user
   login.
============================================================ */

router.post("/redeem", redeemPairingCode);

/* ============================================================
   DEVICE-FACING ROUTES — AUTHENTICATED PATIENT DASHBOARD DATA

   Every route below uses protectPatientDevice, NEVER `protect`.
   The patient is derived entirely from the device token
   (req.patient) — nothing here ever trusts a patientId supplied
   by the frontend.
============================================================ */

router.get("/session", protectPatientDevice, getPatientDeviceSession);

router.get("/me", protectPatientDevice, getMyProfile);

router.get(
  "/me/medications/today",
  protectPatientDevice,
  getMyTodaysMedications
);

router.patch(
  "/me/medications/:medicationId/take",
  protectPatientDevice,
  markMyMedicationTaken
);

router.get("/me/daily-tasks", protectPatientDevice, getMyDailyTasks);

router.patch(
  "/me/daily-tasks/:taskId/complete",
  protectPatientDevice,
  completeMyDailyTask
);

router.post(
  "/me/cognitive-activities",
  protectPatientDevice,
  createMyCognitiveActivity
);

router.get(
  "/me/cognitive-activities/today",
  protectPatientDevice,
  getMyCognitiveActivityToday
);

router.post("/me/help", protectPatientDevice, requestHelp);

router.post("/me/location", protectPatientDevice, updateMyLocation);
router.post("/face-recognition", protectPatientDevice, upload.single("image"), recognizeMyFamilyMember);

export default router;
