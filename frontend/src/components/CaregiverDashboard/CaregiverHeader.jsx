import { useEffect, useState } from "react";
import { FaBars, FaBell, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { STORAGE_KEYS } from "../../config/constants.js";
import { getDoctorUnreadNotificationCount } from "../../api/notification.api.js";

/* ============================================================
   CAREGIVER HEADER

   Reused across every caregiver page. Reads the caregiver's
   own account from localStorage (same pattern as DoctorHeader)
   and pulls a live unread notification count from the backend.
============================================================ */

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const CaregiverHeader = ({
  eyebrow = "Caregiver Dashboard",
  title = "",
  subtitle = "",
  onOpenSidebar = () => {},
}) => {
  const navigate = useNavigate();

  const [caregiver, setCaregiver] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedUser) {
      try {
        setCaregiver(JSON.parse(storedUser));
      } catch (error) {
        console.error("Unable to read caregiver information:", error);
      }
    }
  }, []);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await getDoctorUnreadNotificationCount();
        setUnreadCount(response.count || 0);
      } catch (error) {
        console.error("Unable to load notification count:", error);
      }
    };

    loadUnreadCount();
  }, []);

  const caregiverName = caregiver?.fullName || "Caregiver";
  const profileImage = caregiver?.profilePicture?.url || "";

  return (
    <header className="caregiver-header">
      <div className="caregiver-header__left">
        <button
          type="button"
          className="caregiver-mobile-menu"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <FaBars />
        </button>

        <div>
          <p className="caregiver-header__eyebrow">{eyebrow}</p>
          <h1>{title || `Welcome, ${caregiverName.split(" ")[0]}!`}</h1>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>

      <div className="caregiver-header__right">
        <button
          className="caregiver-header-icon"
          aria-label="Notifications"
          onClick={() => navigate("/caregiver/notifications")}
        >
          <FaBell />
          {unreadCount > 0 && <span />}
        </button>

        <div className="caregiver-header__divider" />

        <button
          type="button"
          className="caregiver-header__profile"
          onClick={() => navigate("/caregiver/profile")}
        >
          {profileImage ? (
            <img src={profileImage} alt={caregiverName} />
          ) : (
            <div className="caregiver-avatar">
              {getInitials(caregiverName)}
            </div>
          )}

          <div className="caregiver-header__profile-text">
            <strong>{caregiverName}</strong>
            <span>Caregiver</span>
          </div>

          <FaChevronRight className="caregiver-profile-arrow" />
        </button>
      </div>
    </header>
  );
};

export default CaregiverHeader;
