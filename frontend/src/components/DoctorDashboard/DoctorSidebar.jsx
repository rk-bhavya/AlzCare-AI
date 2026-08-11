import {
  FaHome,
  FaUserInjured,
  FaBrain,
  FaCalendarAlt,
  FaHeartbeat,
  FaBell,
  FaComments,
  FaUserMd,
  FaCog,
  FaSignOutAlt,
  FaStethoscope,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import { ROUTES } from "../../config/constants";

const DoctorSidebar = ({ activePage = "Dashboard" }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      icon: <FaHome />,
    },
    {
      label: "My Patients",
      icon: <FaUserInjured />,
    },
    {
      label: "AI Reports",
      icon: <FaBrain />,
    },
    {
      label: "Appointments",
      icon: <FaCalendarAlt />,
    },
    {
      label: "Patient Monitoring",
      icon: <FaHeartbeat />,
    },
    {
      label: "Notifications",
      icon: <FaBell />,
    },
    {
      label: "Messages",
      icon: <FaComments />,
    },
  ];

  const bottomItems = [
    {
      label: "Profile",
      icon: <FaUserMd />,
    },
    {
      label: "Settings",
      icon: <FaCog />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("nc_access_token");
    localStorage.removeItem("nc_user");

    navigate(ROUTES.LOGIN, {
      replace: true,
    });
  };

  return (
    <aside className="doctor-sidebar">

      <div className="doctor-sidebar__brand">

        <div className="doctor-sidebar__logo">
          <FaStethoscope />
        </div>

        <div>
          <h2>AlzCare AI</h2>
          <span>Doctor Portal</span>
        </div>

      </div>

      <nav className="doctor-sidebar__nav">

        <p className="doctor-sidebar__section-title">
          MAIN MENU
        </p>

        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`doctor-sidebar__item ${
              activePage === item.label
                ? "doctor-sidebar__item--active"
                : ""
            }`}
          >
            <span className="doctor-sidebar__icon">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        ))}

      </nav>

      <div className="doctor-sidebar__bottom">

        <p className="doctor-sidebar__section-title">
          ACCOUNT
        </p>

        {bottomItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className="doctor-sidebar__item"
          >
            <span className="doctor-sidebar__icon">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        ))}

        <button
          type="button"
          className="doctor-sidebar__item doctor-sidebar__logout"
          onClick={handleLogout}
        >
          <span className="doctor-sidebar__icon">
            <FaSignOutAlt />
          </span>

          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
};

export default DoctorSidebar;