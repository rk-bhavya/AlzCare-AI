import express from "express";

import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import assessmentRoutes from "./assessment.routes.js";
import doctorRoutes from "./doctor.routes.js";
import notificationRoutes from "./notification.routes.js";
import messageRoutes from "./message.routes.js";
import clinicalNoteRoutes from "./clinicalNote.routes.js";


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


export default router;