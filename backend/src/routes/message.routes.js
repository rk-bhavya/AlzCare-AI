import express from "express";

import {
  getDoctorCaregivers,
  getConversation,
  sendMessage,
  getCaregiverDoctors,
  getCaregiverConversation,
} from "../controllers/message.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";


const router = express.Router();


router.use(protect);


/* ============================================================
   DOCTOR: GET CAREGIVERS
============================================================ */

router.get(
  "/caregivers",
  authorizeRoles("doctor"),
  getDoctorCaregivers
);


/* ============================================================
   CAREGIVER: GET ASSIGNED DOCTOR(S)
============================================================ */

router.get(
  "/doctors",
  authorizeRoles("caregiver"),
  getCaregiverDoctors
);


/* ============================================================
   DOCTOR: GET CONVERSATION WITH A CAREGIVER
============================================================ */

router.get(
  "/conversation/:caregiverId",
  authorizeRoles("doctor"),
  getConversation
);


/* ============================================================
   CAREGIVER: GET CONVERSATION WITH A DOCTOR
============================================================ */

router.get(
  "/conversation/doctor/:doctorId",
  authorizeRoles("caregiver"),
  getCaregiverConversation
);


/* ============================================================
   SEND MESSAGE
   (Doctor -> Caregiver, or Caregiver -> Doctor)
============================================================ */

router.post(
  "/",
  authorizeRoles("doctor", "caregiver"),
  sendMessage
);


export default router;
