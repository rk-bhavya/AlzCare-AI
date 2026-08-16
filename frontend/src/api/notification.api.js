import axiosInstance from "./axiosinstance.js";


/* ============================================================
   GET DOCTOR NOTIFICATIONS
============================================================ */

export const getDoctorNotifications =
  async () => {

    const response =
      await axiosInstance.get(
        "/notifications"
      );

    return response.data;
  };


/* ============================================================
   GET UNREAD COUNT
============================================================ */

export const getDoctorUnreadNotificationCount =
  async () => {

    const response =
      await axiosInstance.get(
        "/notifications/count"
      );

    return response.data;
  };


/* ============================================================
   MARK ONE AS READ
============================================================ */

export const markNotificationAsRead =
  async (
    notificationId
  ) => {

    const response =
      await axiosInstance.patch(
        `/notifications/${notificationId}/read`
      );

    return response.data;
  };


/* ============================================================
   MARK ALL AS READ
============================================================ */

export const markAllNotificationsAsRead =
  async () => {

    const response =
      await axiosInstance.patch(
        "/notifications/read-all"
      );

    return response.data;
  };