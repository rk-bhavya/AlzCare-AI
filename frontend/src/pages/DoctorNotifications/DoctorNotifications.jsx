import {
  useEffect,
  useState,
} from "react";

import {
  FaBell,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";

import {
  getDoctorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../api/notification.api.js";

import "./DoctorNotifications.css";


const DoctorNotifications = () => {

  /* ============================================================
     STATE
  ============================================================ */

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedNotification,
    setSelectedNotification,
  ] = useState(null);

  const [
    filter,
    setFilter,
  ] = useState("All");

  const [
    isMarkingAll,
    setIsMarkingAll,
  ] = useState(false);


  /* ============================================================
     LOAD NOTIFICATIONS
  ============================================================ */

  const loadNotifications =
    async () => {

      try {

        setIsLoading(true);
        setError("");

        const response =
          await getDoctorNotifications();

        setNotifications(
          response.notifications || []
        );

      } catch (error) {

        console.error(
          "Unable to load notifications:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load notifications."
        );

      } finally {

        setIsLoading(false);

      }
    };


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadNotifications();

  }, []);


  /* ============================================================
     UNREAD COUNT
  ============================================================ */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;


  /* ============================================================
     FILTER
  ============================================================ */

  const filteredNotifications =
    notifications.filter(
      (notification) => {

        if (
          filter === "Unread"
        ) {
          return !notification.isRead;
        }

        if (
          filter === "Alerts"
        ) {
          return (
            notification.type ===
              "warning" ||
            notification.type ===
              "critical"
          );
        }

        return true;
      }
    );


  /* ============================================================
     MARK ONE AS READ
  ============================================================ */

  const handleMarkAsRead =
    async (notification) => {

      if (
        notification.isRead
      ) {
        return;
      }

      try {

        await markNotificationAsRead(
          notification._id
        );

        setNotifications(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                notification._id
                  ? {
                      ...item,
                      isRead: true,
                    }
                  : item
            )
        );

      } catch (error) {

        console.error(
          "Unable to mark notification as read:",
          error
        );

      }
    };


  /* ============================================================
     MARK ALL AS READ
  ============================================================ */

  const handleMarkAllAsRead =
    async () => {

      if (
        unreadCount === 0
      ) {
        return;
      }

      try {

        setIsMarkingAll(true);

        await markAllNotificationsAsRead();

        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );

      } catch (error) {

        console.error(
          "Unable to mark all notifications:",
          error
        );

      } finally {

        setIsMarkingAll(false);

      }
    };


  /* ============================================================
     OPEN NOTIFICATION
  ============================================================ */

  const openNotification =
    async (
      notification
    ) => {

      await handleMarkAsRead(
        notification
      );

      setSelectedNotification(
        {
          ...notification,
          isRead: true,
        }
      );
    };


  /* ============================================================
     ICON
  ============================================================ */

  const getNotificationIcon =
    (type) => {

      if (
        type === "critical"
      ) {
        return (
          <FaExclamationTriangle />
        );
      }

      if (
        type === "warning"
      ) {
        return (
          <FaExclamationTriangle />
        );
      }

      if (
        type === "success"
      ) {
        return (
          <FaCheckCircle />
        );
      }

      return (
        <FaInfoCircle />
      );
    };


  /* ============================================================
     RELATIVE TIME
  ============================================================ */

  const formatRelativeTime =
    (createdAt) => {

      if (!createdAt) {
        return "Recently";
      }

      const createdTime =
        new Date(
          createdAt
        ).getTime();

      const difference =
        Math.max(
          0,
          Date.now() -
            createdTime
        );

      const minutes =
        Math.floor(
          difference /
            (1000 * 60)
        );

      if (
        minutes < 1
      ) {
        return "Just now";
      }

      if (
        minutes < 60
      ) {
        return `${minutes} min${
          minutes === 1
            ? ""
            : "s"
        } ago`;
      }

      const hours =
        Math.floor(
          minutes / 60
        );

      if (
        hours < 24
      ) {
        return `${hours} hour${
          hours === 1
            ? ""
            : "s"
        } ago`;
      }

      const days =
        Math.floor(
          hours / 24
        );

      return `${days} day${
        days === 1
          ? ""
          : "s"
      } ago`;
    };


  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {

    return (
      <div className="doctor-dashboard">

        <DoctorSidebar
          activePage="Notifications"
        />

        <main className="doctor-dashboard__main">

          <DoctorHeader />

          <div className="doctor-dashboard__content">

            <section className="doctor-dashboard__card">

              <div
                style={{
                  minHeight: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontSize: "14px",
                  color: "#718295",
                }}
              >

                <FaSpinner />

                Loading notifications...

              </div>

            </section>

          </div>

        </main>

      </div>
    );
  }


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="doctor-dashboard">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <DoctorSidebar
        activePage="Notifications"
      />


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="doctor-dashboard__main">

        <DoctorHeader />


        <div className="doctor-dashboard__content doctor-notifications">


          {/* ==================================================
              HEADER
          ================================================== */}

          <section className="doctor-notifications__header">

            <div>

              <span>
                NOTIFICATIONS
              </span>

              <h1>
                Notifications
              </h1>

              <p>
                Stay updated about your patients,
                assessments, appointments and alerts.
              </p>

            </div>


            <div className="doctor-notifications__count">

              <FaBell />

              <div>

                <strong>
                  {unreadCount}
                </strong>

                <span>
                  Unread
                </span>

              </div>

            </div>

          </section>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div
              style={{
                marginBottom: "18px",
                padding: "12px 15px",
                borderRadius: "7px",
                background: "#fcf5f6",
                border:
                  "1px solid #eadbdd",
                color: "#98656b",
                fontSize: "14px",
              }}
            >
              {error}
            </div>

          )}


          {/* ==================================================
              NOTIFICATIONS CARD
          ================================================== */}

          <section className="doctor-dashboard__card doctor-notifications__card">


            {/* TOOLBAR */}

            <div className="doctor-notifications__toolbar">

              <div className="doctor-notifications__filters">

                <button
                  type="button"
                  className={
                    filter === "All"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("All")
                  }
                >
                  All
                </button>


                <button
                  type="button"
                  className={
                    filter === "Unread"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("Unread")
                  }
                >
                  Unread
                </button>


                <button
                  type="button"
                  className={
                    filter === "Alerts"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("Alerts")
                  }
                >
                  Alerts
                </button>

              </div>


              <button
                type="button"
                className="doctor-notifications__mark-all"
                onClick={
                  handleMarkAllAsRead
                }
                disabled={
                  unreadCount === 0 ||
                  isMarkingAll
                }
              >

                {isMarkingAll
                  ? "Updating..."
                  : "Mark all as read"}

              </button>

            </div>


            {/* ==================================================
                LIST
            ================================================== */}

            <div className="doctor-notifications__list">

              {filteredNotifications.length ===
              0 ? (

                <div className="doctor-notifications__empty">

                  <FaCheckCircle />

                  <strong>
                    You're all caught up
                  </strong>

                  <span>
                    There are no notifications
                    matching this filter.
                  </span>

                </div>

              ) : (

                filteredNotifications.map(
                  (notification) => {

                    const patientName =
                      notification.patientId
                        ?.fullName ||
                      "System";


                    return (
                      <button
                        type="button"
                        className={`doctor-notification ${
                          !notification.isRead
                            ? "doctor-notification--unread"
                            : ""
                        }`}
                        key={
                          notification._id
                        }
                        onClick={() =>
                          openNotification(
                            notification
                          )
                        }
                      >

                        {/* ICON */}

                        <div
                          className={`doctor-notification__icon doctor-notification__icon--${notification.type}`}
                        >
                          {getNotificationIcon(
                            notification.type
                          )}
                        </div>


                        {/* CONTENT */}

                        <div className="doctor-notification__content">

                          <div className="doctor-notification__title">

                            <strong>
                              {
                                notification.title
                              }
                            </strong>

                            {!notification.isRead && (

                              <span>
                                New
                              </span>

                            )}

                          </div>


                          <p>
                            {
                              notification.message
                            }
                          </p>


                          <div className="doctor-notification__meta">

                            <strong>
                              {patientName}
                            </strong>

                            <span>
                              {formatRelativeTime(
                                notification.createdAt
                              )}
                            </span>

                          </div>

                        </div>


                        {/* UNREAD DOT */}

                        {!notification.isRead && (

                          <span className="doctor-notification__dot" />

                        )}

                      </button>
                    );
                  }
                )

              )}

            </div>

          </section>

        </div>

      </main>


      {/* ======================================================
          DETAILS MODAL
      ====================================================== */}

      {selectedNotification && (

        <div
          className="doctor-notification-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedNotification(
                null
              );
            }

          }}
        >

          <div className="doctor-notification-modal">


            <div className="doctor-notification-modal__header">

              <div>

                <span>
                  NOTIFICATION
                </span>

                <h2>
                  {
                    selectedNotification.title
                  }
                </h2>

              </div>


              <button
                type="button"
                className="doctor-notification-modal__close"
                onClick={() =>
                  setSelectedNotification(
                    null
                  )
                }
              >
                <FaTimes />
              </button>

            </div>


            <div className="doctor-notification-modal__body">

              <div
                className={`doctor-notification-modal__icon doctor-notification-modal__icon--${selectedNotification.type}`}
              >
                {getNotificationIcon(
                  selectedNotification.type
                )}
              </div>


              <div>

                <strong>
                  {
                    selectedNotification
                      .patientId
                      ?.fullName ||
                    "System"
                  }
                </strong>

                <span>
                  {
                    formatRelativeTime(
                      selectedNotification.createdAt
                    )
                  }
                </span>

              </div>

            </div>


            <p className="doctor-notification-modal__message">

              {
                selectedNotification.message
              }

            </p>


            <div className="doctor-notification-modal__actions">

              <button
                type="button"
                onClick={() =>
                  setSelectedNotification(
                    null
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};


export default DoctorNotifications;