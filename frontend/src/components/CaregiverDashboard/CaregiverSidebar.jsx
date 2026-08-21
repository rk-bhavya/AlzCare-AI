import {
  FaHome,
  FaUser,
  FaPills,
  FaCalendarAlt,
  FaHeartbeat,
  FaBell,
  FaComments,
  FaCog,
  FaSignOutAlt,
  FaBrain,
  FaShieldAlt,
  FaTimes,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import { ROUTES, STORAGE_KEYS } from "../../config/constants.js";

/* ============================================================
   CAREGIVER SIDEBAR

   Reused across every caregiver page. Mirrors the visual
   identity of DoctorSidebar / the existing caregiver CSS.
============================================================ */

const CaregiverSidebar = ({
  activePage = "Dashboard",
  isOpen = false,
  onClose = () => {},
}) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", icon: <FaHome />, path: "/caregiver/dashboard" },
    { label: "My Patients", icon: <FaUser />, path: "/caregiver/patients" },
    {
      label: "Medications",
      icon: <FaPills />,
      path: "/caregiver/medications",
    },
    {
      label: "Appointments",
      icon: <FaCalendarAlt />,
      path: "/caregiver/appointments",
    },
    {
      label: "Patient Monitoring",
      icon: <FaHeartbeat />,
      path: "/caregiver/monitoring",
    },
    {
      label: "Notifications",
      icon: <FaBell />,
      path: "/caregiver/notifications",
    },
    { label: "Messages", icon: <FaComments />, path: "/caregiver/messages" },
  ];

  const bottomItems = [
    { label: "Profile", icon: <FaUser />, path: "/caregiver/profile" },
    { label: "Settings", icon: <FaCog />, path: "/caregiver/settings" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);

    navigate(ROUTES.CAREGIVER_LOGIN, { replace: true });
  };

  return (
    <aside
      className={`caregiver-sidebar ${
        isOpen ? "caregiver-sidebar--open" : ""
      }`}
    >
      <div className="caregiver-sidebar__brand">
        <div className="caregiver-sidebar__logo">
          <FaBrain />
        </div>

        <div>
          <h2>AlzCare AI</h2>
          <span>Caregiver Portal</span>
        </div>

        <button
          type="button"
          className="caregiver-sidebar__close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <FaTimes />
        </button>
      </div>

      <nav className="caregiver-sidebar__nav">
        <p className="caregiver-sidebar__label">MAIN MENU</p>

        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`caregiver-nav-item ${
              activePage === item.label
                ? "caregiver-nav-item--active"
                : ""
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        <p className="caregiver-sidebar__label caregiver-sidebar__label--secondary">
          ACCOUNT
        </p>

        {bottomItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`caregiver-nav-item ${
              activePage === item.label
                ? "caregiver-nav-item--active"
                : ""
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="caregiver-sidebar__bottom">
        <div className="caregiver-sidebar__support">
          <FaShieldAlt />

          <div>
            <strong>Care & Safety</strong>
            <span>Patient monitoring active</span>
          </div>
        </div>

        <button className="caregiver-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default CaregiverSidebar;
