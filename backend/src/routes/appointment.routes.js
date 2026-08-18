import express from "express";

import {
  createAppointment,
  getDoctorAppointments,
  getTodaysAppointments,
  updateAppointmentStatus,
  getCaregiverAppointments,
  getCaregiverTodaysAppointments,
} from "../controllers/appointment.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";


const router = express.Router();


/* ============================================================
   CREATE APPOINTMENT
   Doctor creates an appointment for a patient
============================================================ */

router.post(
  "/",
  protect,
  authorizeRoles("doctor"),
  createAppointment
);


/* ============================================================
   GET TODAY'S APPOINTMENTS
   IMPORTANT: Keep this BEFORE /:appointmentId/status
============================================================ */

router.get(
  "/today",
  protect,
  authorizeRoles("doctor"),
  getTodaysAppointments
);


/* ============================================================
   GET UPCOMING APPOINTMENTS
============================================================ */

router.get(
  "/",
  protect,
  authorizeRoles("doctor"),
  getDoctorAppointments
);


/* ============================================================
   UPDATE APPOINTMENT STATUS
============================================================ */

router.patch(
  "/:appointmentId/status",
  protect,
  authorizeRoles("doctor"),
  updateAppointmentStatus
);


/* ============================================================
   CAREGIVER: GET TODAY'S APPOINTMENTS FOR ASSIGNED PATIENTS
   IMPORTANT: Keep this BEFORE /caregiver/:something-else
============================================================ */

router.get(
  "/caregiver/today",
  protect,
  authorizeRoles("caregiver"),
  getCaregiverTodaysAppointments
);


/* ============================================================
   CAREGIVER: GET ALL APPOINTMENTS FOR ASSIGNED PATIENTS

   REUSES the existing Appointment model/routes file — this is
   not a duplicate appointment system.
============================================================ */

router.get(
  "/caregiver",
  protect,
  authorizeRoles("caregiver"),
  getCaregiverAppointments
);


export default router;