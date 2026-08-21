import express from "express";

import {
  createDailyTask,
  getPatientDailyTasks,
  updateDailyTask,
  completeDailyTask,
  deleteDailyTask,
} from "../controllers/dailyTask.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/* ============================================================
   ALL DAILY TASK ROUTES REQUIRE:
   - Valid JWT
   - Caregiver role

   Ownership of the patient is verified inside every controller
   through CareAssignment before any read/write happens.
============================================================ */

router.use(protect, authorizeRoles("caregiver"));

/* ============================================================
   CREATE DAILY TASK
============================================================ */

router.post("/", createDailyTask);

/* ============================================================
   GET DAILY TASKS FOR A PATIENT
============================================================ */

router.get("/patient/:patientId", getPatientDailyTasks);

/* ============================================================
   UPDATE DAILY TASK
============================================================ */

router.put("/:taskId", updateDailyTask);

/* ============================================================
   MARK DAILY TASK COMPLETED / PENDING
============================================================ */

router.patch("/:taskId/complete", completeDailyTask);

/* ============================================================
   DELETE DAILY TASK
============================================================ */

router.delete("/:taskId", deleteDailyTask);

export default router;
