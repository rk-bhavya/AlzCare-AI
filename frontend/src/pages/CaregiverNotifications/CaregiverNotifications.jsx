import { useEffect, useState } from "react";

import {
  FaBell,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckDouble,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";

import {
  getDoctorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../api/notification.api.js";

import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

const formatRelativeTime = (createdAt) => {
  if (!createdAt) return "Recently";

  const diffMs = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const typeIcon = (type) => {
  if (type === "critical") return <FaExclamationCircle />;
  if (type === "warning") return <FaExclamationTriangle />;
  return <FaInfoCircle />;
};

const typeVariant = (type) => {
  if (type === "critical") return "cg-badge--red";
  if (type === "warning") return "cg-badge--orange";
  return "cg-badge--blue";
};

const CaregiverNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getDoctorNotifications();
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error("Unable to load notifications:", err);
      setError(
        err.response?.data?.message || "Unable to load notifications."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Unable to mark notification as read:", err);
    }
  };

  const handleMarkAll = async () => {
    try {
      setIsMarkingAll(true);
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error("Unable to mark all notifications as read:", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <CaregiverPageLayout
      activePage="Notifications"
      eyebrow="Alerts"
      title="Notifications"
      subtitle="Alerts relevant to you and your assigned patients."
    >
      <div className="cg-card">
        <div className="cg-card__header">
          <div>
            <span>{unreadCount} UNREAD</span>
            <h2>Notifications</h2>
          </div>

          <button
            type="button"
            className="cg-btn cg-btn--outline cg-btn--sm"
            onClick={handleMarkAll}
            disabled={isMarkingAll || unreadCount === 0}
          >
            <FaCheckDouble />
            Mark All as Read
          </button>
        </div>

        {isLoading ? (
          <div className="cg-state">
            <FaSpinner className="appointment-spinner" />
            Loading notifications...
          </div>
        ) : error ? (
          <div className="cg-state cg-state--error">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button
              className="cg-btn cg-btn--outline cg-btn--sm"
              onClick={loadNotifications}
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="cg-state">
            <FaBell />
            <strong>No notifications</strong>
            <span>You're all caught up.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid #eef1f6",
                  background: notification.isRead ? "#ffffff" : "#f7fbfa",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "#eef2ff",
                    color: "#4338ca",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {typeIcon(notification.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong style={{ fontSize: 14 }}>
                      {notification.title}
                    </strong>
                    <span className={`cg-badge ${typeVariant(notification.type)}`}>
                      {notification.type}
                    </span>
                  </div>

                  <p style={{ fontSize: 14, color: "#45506a", marginTop: 4 }}>
                    {notification.message}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <small style={{ fontSize: 12, color: "#8b96ab" }}>
                      {formatRelativeTime(notification.createdAt)}
                    </small>

                    {!notification.isRead && (
                      <button
                        type="button"
                        className="cg-btn cg-btn--ghost cg-btn--sm"
                        onClick={() => handleMarkRead(notification._id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CaregiverPageLayout>
  );
};

export default CaregiverNotifications;
