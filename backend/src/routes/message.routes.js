import express from "express";

import {
  getDoctorCaregivers,
  getConversation,
  sendMessage,
} from "../controllers/message.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";


const router = express.Router();


router.use(
  protect,
  authorizeRoles("doctor")
);


/* ============================================================
   GET CAREGIVERS
============================================================ */

router.get(
  "/caregivers",
  getDoctorCaregivers
);


/* ============================================================
   GET CONVERSATION
============================================================ */

router.get(
  "/conversation/:caregiverId",
  getConversation
);


/* ============================================================
   SEND MESSAGE
============================================================ */

router.post(
  "/",
  sendMessage
);


export default router;