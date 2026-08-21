import mongoose from "mongoose";

import Notification from "../models/Notification.js";


/* ============================================================
   GET DOCTOR NOTIFICATIONS
============================================================ */

export const getDoctorNotifications =
  async (req, res) => {

    try {

      const notifications =
        await Notification.find({
          recipientId: req.user._id,
        })
          .populate({
            path: "patientId",
            select:
              "fullName age gender profilePicture",
          })
          .sort({
            createdAt: -1,
          })
          .lean();


      const unreadCount =
        notifications.filter(
          (notification) =>
            !notification.isRead
        ).length;


      return res.status(200).json({
        success: true,
        notifications,
        unreadCount,
      });

    } catch (error) {

      console.error(
        "Get doctor notifications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load notifications.",
      });
    }
  };


/* ============================================================
   GET UNREAD NOTIFICATION COUNT
============================================================ */

export const getDoctorUnreadNotificationCount =
  async (req, res) => {

    try {

      const unreadCount =
        await Notification.countDocuments({
          recipientId:
            req.user._id,

          isRead: false,
        });


      return res.status(200).json({
        success: true,
        count: unreadCount,
      });

    } catch (error) {

      console.error(
        "Get unread notification count error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load notification count.",
      });
    }
  };


/* ============================================================
   MARK ONE NOTIFICATION AS READ
============================================================ */

export const markNotificationAsRead =
  async (req, res) => {

    try {

      const {
        notificationId,
      } = req.params;


      if (
        !mongoose.isValidObjectId(
          notificationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification ID.",
        });
      }


      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: notificationId,

            recipientId:
              req.user._id,
          },

          {
            $set: {
              isRead: true,
            },
          },

          {
            new: true,
          }
        )
          .populate({
            path: "patientId",
            select:
              "fullName age gender profilePicture",
          });


      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found.",
        });
      }


      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read.",
        notification,
      });

    } catch (error) {

      console.error(
        "Mark notification as read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update notification.",
      });
    }
  };


/* ============================================================
   MARK ALL NOTIFICATIONS AS READ
============================================================ */

export const markAllNotificationsAsRead =
  async (req, res) => {

    try {

      await Notification.updateMany(
        {
          recipientId:
            req.user._id,

          isRead: false,
        },

        {
          $set: {
            isRead: true,
          },
        }
      );


      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read.",
      });

    } catch (error) {

      console.error(
        "Mark all notifications as read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update notifications.",
      });
    }
  };