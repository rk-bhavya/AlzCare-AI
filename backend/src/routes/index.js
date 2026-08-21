import express from "express";

import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import assessmentRoutes from "./assessment.routes.js";
import doctorRoutes from "./doctor.routes.js";
import notificationRoutes from "./notification.routes.js";
import messageRoutes from "./message.routes.js";
import clinicalNoteRoutes from "./clinicalNote.routes.js";
import caregiverRoutes from "./caregiver.routes.js";
import medicationRoutes from "./medication.routes.js";
import cognitiveRoutes from "./cognitive.routes.js";
import familyMemberRoutes from "./familyMember.routes.js";
import dailyTaskRoutes from "./dailyTask.routes.js";
import patientDeviceRoutes from "./patientDevice.routes.js";


const router =
  express.Router();


/* ============================================================
   HEALTH
============================================================ */

router.use(
  "/health",
  healthRoutes
);


/* ============================================================
   AUTH
============================================================ */

router.use(
  "/auth",
  authRoutes
);


/* ============================================================
   APPOINTMENTS
============================================================ */

router.use(
  "/appointments",
  appointmentRoutes
);


/* ============================================================
   ASSESSMENTS
============================================================ */

router.use(
  "/assessments",
  assessmentRoutes
);


/* ============================================================
   DOCTOR
============================================================ */

router.use(
  "/doctor",
  doctorRoutes
);


/* ============================================================
   NOTIFICATIONS
============================================================ */

router.use(
  "/notifications",
  notificationRoutes
);


/* ============================================================
   MESSAGES
============================================================ */

router.use(
  "/messages",
  messageRoutes
);


/* ============================================================
   CLINICAL NOTES
============================================================ */

router.use(
  "/clinical-notes",
  clinicalNoteRoutes
);


/* ============================================================
   CAREGIVER
============================================================ */

router.use(
  "/caregiver",
  caregiverRoutes
);


/* ============================================================
   MEDICATIONS
============================================================ */

router.use(
  "/medications",
  medicationRoutes
);


/* ============================================================
   COGNITIVE ASSISTANCE
============================================================ */

router.use(
  "/cognitive",
  cognitiveRoutes
);


/* ============================================================
   FAMILY MEMBERS
============================================================ */

router.use(
  "/family-members",
  familyMemberRoutes
);


/* ============================================================
   DAILY TASKS
============================================================ */

router.use(
  "/daily-tasks",
  dailyTaskRoutes
);


/* ============================================================
   PATIENT DEVICE (foundation only — no Patient Dashboard yet)
============================================================ */

router.use(
  "/patient-devices",
  patientDeviceRoutes
);


export default router;