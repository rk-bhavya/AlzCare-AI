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

router.use(
  protect,
  authorizeRoles("doctor")
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