import express from "express";

import {
  getDoctorNotifications,
  getDoctorUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";


const router = express.Router();


/* ============================================================
   ALL NOTIFICATION ROUTES
============================================================ */

/* ============================================================
   NOTE:
   getDoctorNotifications / markNotificationAsRead / etc. are
   role-agnostic — they always filter by req.user._id — so the
   same functions are safely reused for caregivers here instead
   of duplicating a parallel notification system.
============================================================ */

router.use(
  protect,
  authorizeRoles("doctor", "caregiver")
);


/* ============================================================
   GET ALL NOTIFICATIONS
============================================================ */

router.get(
  "/",
  getDoctorNotifications
);


/* ============================================================
   GET UNREAD COUNT
============================================================ */

router.get(
  "/count",
  getDoctorUnreadNotificationCount
);


/* ============================================================
   MARK ALL AS READ

   IMPORTANT:
   Keep this BEFORE /:notificationId/read
============================================================ */

router.patch(
  "/read-all",
  markAllNotificationsAsRead
);


/* ============================================================
   MARK ONE AS READ
============================================================ */

router.patch(
  "/:notificationId/read",
  markNotificationAsRead
);


export default router;