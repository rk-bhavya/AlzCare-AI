import express from "express";

import {
  createCognitiveActivity,
  getCognitiveHistory,
} from "../controllers/cognitive.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("caregiver"));

/* ============================================================
   SAVE A COMPLETED ACTIVITY RESULT
============================================================ */

router.post("/", createCognitiveActivity);

/* ============================================================
   GET ACTIVITY HISTORY / PROGRESS FOR A PATIENT
============================================================ */

router.get("/patient/:patientId", getCognitiveHistory);

export default router;
