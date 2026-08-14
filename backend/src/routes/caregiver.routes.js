import express from "express";

import {
  getCaregiverDashboard,
} from "../controllers/caregiver.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/* ============================================================
   CAREGIVER DASHBOARD
============================================================ */

router.get(
  "/dashboard",
  protect,
  authorizeRoles("caregiver"),
  getCaregiverDashboard
);

export default router;