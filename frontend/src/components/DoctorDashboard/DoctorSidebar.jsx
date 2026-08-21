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


const DoctorSidebar = ({
  activePage = "Dashboard",
}) => {

  const navigate = useNavigate();


  /* ============================================================
     MAIN MENU
  ============================================================ */

  const menuItems = [
    {
      label: "Dashboard",
      icon: <FaHome />,
      path: "/doctor/dashboard",
    },

    {
      label: "My Patients",
      icon: <FaUserInjured />,
      path: "/doctor/patients",
    },

    {
      label: "AI Reports",
      icon: <FaBrain />,
      path: "/doctor/ai-reports",
    },

    {
      label: "Appointments",
      icon: <FaCalendarAlt />,
      path: "/doctor/appointments",
    },

    {
      label: "Patient Monitoring",
      icon: <FaHeartbeat />,
      path: "/doctor/monitoring",
    },

    {
      label: "Notifications",
      icon: <FaBell />,
      path: "/doctor/notifications",
    },

    {
      label: "Messages",
      icon: <FaComments />,
      path: "/doctor/messages",
    },
  ];


  /* ============================================================
     ACCOUNT MENU
  ============================================================ */

  const bottomItems = [
    {
      label: "Profile",
      icon: <FaUserMd />,
      path: "/doctor/profile",
    },

    {
      label: "Settings",
      icon: <FaCog />,
      path: "/doctor/settings",
    },
  ];


  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleNavigation = (path) => {
    navigate(path);
  };


  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout = () => {

    localStorage.removeItem(
      "nc_access_token"
    );

    localStorage.removeItem(
      "nc_user"
    );

    navigate(
      ROUTES.LOGIN,
      {
        replace: true,
      }
    );

  };


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <aside className="doctor-sidebar">

      {/* ======================================================
          BRAND
      ====================================================== */}

      <div className="doctor-sidebar__brand">

        <div className="doctor-sidebar__logo">
          <FaStethoscope />
        </div>

        <div>

          <h2>
            AlzCare AI
          </h2>

          <span>
            Doctor Portal
          </span>

        </div>

      </div>


      {/* ======================================================
          MAIN MENU
      ====================================================== */}

      <nav className="doctor-sidebar__nav">

        <p className="doctor-sidebar__section-title">
          MAIN MENU
        </p>


        {menuItems.map(
          (item) => (

            <button
              key={item.label}
              type="button"
              className={`doctor-sidebar__item ${
                activePage === item.label
                  ? "doctor-sidebar__item--active"
                  : ""
              }`}
              onClick={() =>
                handleNavigation(
                  item.path
                )
              }
            >

              <span className="doctor-sidebar__icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

            </button>

          )
        )}

      </nav>


      {/* ======================================================
          ACCOUNT
      ====================================================== */}

      <div className="doctor-sidebar__bottom">

        <p className="doctor-sidebar__section-title">
          ACCOUNT
        </p>


        {bottomItems.map(
          (item) => (

            <button
              key={item.label}
              type="button"
              className={`doctor-sidebar__item ${
                activePage === item.label
                  ? "doctor-sidebar__item--active"
                  : ""
              }`}
              onClick={() =>
                handleNavigation(
                  item.path
                )
              }
            >

              <span className="doctor-sidebar__icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

            </button>

          )
        )}


        {/* ==================================================
            LOGOUT
        ================================================== */}

        <button
          type="button"
          className="doctor-sidebar__item doctor-sidebar__logout"
          onClick={handleLogout}
        >

          <span className="doctor-sidebar__icon">
            <FaSignOutAlt />
          </span>

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
};


export default DoctorSidebar;