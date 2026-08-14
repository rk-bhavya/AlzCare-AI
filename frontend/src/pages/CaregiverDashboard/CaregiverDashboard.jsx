import { useEffect, useState } from "react";

import {
  FaBell,
  FaCalendarAlt,
  FaChevronRight,
  FaClock,
  FaCog,
  FaHeartbeat,
  FaHome,
  FaMapMarkerAlt,
  FaPills,
  FaSignOutAlt,
  FaUser,
  FaUserMd,
  FaBrain,
  FaGamepad,
  FaExclamationTriangle,
  FaFileMedical,
  FaBars,
  FaTimes,
  FaPlus,
  FaArrowUp,
  FaCheckCircle,
  FaShieldAlt,
  FaChartLine,
} from "react-icons/fa";

import { getCaregiverDashboard } from "../../api/caregiver.api.js";

import "./CaregiverDashboard.css";

const CaregiverDashboard = () => {
  /* ============================================================
     SIDEBAR
  ============================================================ */

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /* ============================================================
     DYNAMIC DASHBOARD DATA
  ============================================================ */

  const [dashboardData, setDashboardData] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ============================================================
     LOAD DASHBOARD DATA
  ============================================================ */

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data =
          await getCaregiverDashboard();

        setDashboardData(data);
      } catch (err) {
        console.error(
          "Caregiver dashboard error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load your dashboard. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* ============================================================
     HELPERS
  ============================================================ */

  const getInitials = (name = "") => {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleAction = (label) => {
    /*
     * Navigation/actions will be connected
     * to their actual features later.
     */
    console.log(`${label} clicked`);
  };

  /* ============================================================
     DERIVED DATA
  ============================================================ */

  const caregiver =
    dashboardData?.caregiver || null;

  const patient =
    dashboardData?.patient || null;

  const doctor =
    dashboardData?.doctor || null;

  const caregiverName =
    caregiver?.fullName || "Caregiver";

  const caregiverInitials =
    getInitials(caregiverName);

  const patientInitials =
    patient
      ? getInitials(patient.fullName)
      : "—";

  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (isLoading) {
    return (
      <div className="caregiver-dashboard caregiver-dashboard--loading">
        <div className="caregiver-dashboard-loader">
          <div className="caregiver-dashboard-loader__icon">
            <FaBrain />
          </div>

          <h2>Loading your dashboard...</h2>

          <p>
            Preparing your caregiver portal.
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR STATE
  ============================================================ */

  if (error) {
    return (
      <div className="caregiver-dashboard caregiver-dashboard--loading">
        <div className="caregiver-dashboard-loader">
          <div className="caregiver-dashboard-loader__icon caregiver-dashboard-loader__icon--error">
            <FaExclamationTriangle />
          </div>

          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <button
            className="caregiver-primary-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="caregiver-dashboard">

      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <div
          className="caregiver-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`caregiver-sidebar ${
          sidebarOpen
            ? "caregiver-sidebar--open"
            : ""
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
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="caregiver-sidebar__nav">
          <p className="caregiver-sidebar__label">
            MAIN MENU
          </p>

          <button className="caregiver-nav-item caregiver-nav-item--active">
            <FaHome />
            <span>Dashboard</span>
          </button>

          <button
            className="caregiver-nav-item"
            onClick={() =>
              handleAction("Patient")
            }
          >
            <FaUser />
            <span>Patient</span>
          </button>

          <button
            className="caregiver-nav-item"
            onClick={() =>
              handleAction("AI Detection")
            }
          >
            <FaBrain />
            <span>AI Detection</span>
          </button>

          <button
            className="caregiver-nav-item"
            onClick={() =>
              handleAction("Medications")
            }
          >
            <FaPills />
            <span>Medications</span>
          </button>

          <button
            className="caregiver-nav-item"
            onClick={() =>
              handleAction("Appointments")
            }
          >
            <FaCalendarAlt />
            <span>Appointments</span>
          </button>

          <button
            className="caregiver-nav-item"
            onClick={() =>
              handleAction("Cognitive Assistance")
            }
          >
            <FaGamepad />
            <span>
              Cognitive Assistance
            </span>
          </button>

          <button
            className="caregiver-nav-item"
            onClick={() =>
              handleAction("Location Tracking")
            }
          >
            <FaMapMarkerAlt />
            <span>Location Tracking</span>
          </button>

          <button
            className="caregiver-nav-item"
            onClick={() =>
              handleAction("Emergency Alerts")
            }
          >
            <FaExclamationTriangle />

            <span>Emergency Alerts</span>

            <span className="caregiver-nav-badge">
              2
            </span>
          </button>

          <button
            className="caregiver-nav-item"
            onClick={() =>
              handleAction("Notifications")
            }
          >
            <FaBell />
            <span>Notifications</span>
          </button>

          <p className="caregiver-sidebar__label caregiver-sidebar__label--secondary">
            ACCOUNT
          </p>

          <button
            className="caregiver-nav-item"
            onClick={() =>
              handleAction("Profile")
            }
          >
            <FaUser />
            <span>Profile</span>
          </button>

          <button
            className="caregiver-nav-item"
            onClick={() =>
              handleAction("Settings")
            }
          >
            <FaCog />
            <span>Settings</span>
          </button>
        </nav>

        <div className="caregiver-sidebar__bottom">
          <div className="caregiver-sidebar__support">
            <FaShieldAlt />

            <div>
              <strong>Care & Safety</strong>

              <span>
                Patient monitoring active
              </span>
            </div>
          </div>

          <button
            className="caregiver-logout"
            onClick={() =>
              handleAction("Logout")
            }
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <main className="caregiver-main">

        {/* ====================================================
            TOP HEADER
        ==================================================== */}

        <header className="caregiver-header">

          <div className="caregiver-header__left">

            <button
              type="button"
              className="caregiver-mobile-menu"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open navigation"
            >
              <FaBars />
            </button>

            <div>
              <p className="caregiver-header__eyebrow">
                Caregiver Dashboard
              </p>

              <h1>
                Good morning,{" "}
                {caregiverName.split(" ")[0]}!
              </h1>
            </div>
          </div>

          <div className="caregiver-header__right">

            <button
              className="caregiver-header-icon"
              aria-label="Notifications"
              onClick={() =>
                handleAction("Notifications")
              }
            >
              <FaBell />

              <span />
            </button>

            <div className="caregiver-header__divider" />

            <div className="caregiver-header__profile">

              <div className="caregiver-avatar">
                {caregiverInitials}
              </div>

              <div className="caregiver-header__profile-text">
                <strong>
                  {caregiverName}
                </strong>

                <span>Caregiver</span>
              </div>

              <FaChevronRight className="caregiver-profile-arrow" />
            </div>
          </div>
        </header>

        {/* ====================================================
            DASHBOARD CONTENT
        ==================================================== */}

        <div className="caregiver-content">

          {/* ==================================================
              STATUS STRIP
          ================================================== */}

          <section className="caregiver-status-strip">

            <div className="caregiver-status-strip__icon">
              <FaHeartbeat />
            </div>

            <div>
              <strong>
                {patient
                  ? "Patient monitoring is active"
                  : "Caregiver account is active"}
              </strong>

              <p>
                {patient
                  ? `${patient.fullName}'s latest information is available for review.`
                  : "No patient has been assigned to you yet. Patient information will appear here once a doctor assigns a patient."}
              </p>
            </div>

            <span className="caregiver-live-status">
              <i />
              Live
            </span>

          </section>

          {/* ==================================================
              PATIENT OVERVIEW
          ================================================== */}

          <section className="caregiver-section">

            <div className="caregiver-section-heading">

              <div>
                <span>PRIMARY PATIENT</span>
                <h2>Patient Overview</h2>
              </div>

              {patient && (
                <button
                  className="caregiver-outline-button"
                  onClick={() =>
                    handleAction("View Patient")
                  }
                >
                  View Patient
                  <FaChevronRight />
                </button>
              )}

            </div>

            <div className="caregiver-patient-overview">

              {/* ============================================
                  PATIENT MAIN INFORMATION
              ============================================ */}

              {patient ? (
                <>
                  <div className="caregiver-patient-main">

                    <div className="caregiver-patient-avatar">
                      {patientInitials}
                    </div>

                    <div className="caregiver-patient-details">

                      <h3>
                        {patient.fullName}
                      </h3>

                      <p>
                        {patient.age} years
                        <span>•</span>
                        {patient.gender}
                      </p>

                      <div className="caregiver-patient-status">
                        <span className="caregiver-status-dot caregiver-status-dot--warning" />

                        Needs Monitoring
                      </div>

                    </div>
                  </div>

                  {/* ==========================================
                      PATIENT INFORMATION
                  ========================================== */}

                  <div className="caregiver-patient-info">

                    <div>
                      <span>EMAIL</span>
                      <strong>
                        {patient.email}
                      </strong>
                    </div>

                    <div>
                      <span>PHONE</span>
                      <strong>
                        {patient.phone}
                      </strong>
                    </div>

                    <div>
                      <span>EMERGENCY CONTACT</span>
                      <strong>
                        {patient.emergencyContact ||
                          "Not available"}
                      </strong>
                    </div>

                  </div>
                </>
              ) : (
                /* ==========================================
                   NO PATIENT STATE
                ========================================== */

                <div className="caregiver-no-patient">

                  <div className="caregiver-no-patient__icon">
                    <FaUser />
                  </div>

                  <div>
                    <h3>
                      No patient assigned yet
                    </h3>

                    <p>
                      Your patient's information
                      will appear here once a
                      doctor assigns a patient
                      to your care.
                    </p>
                  </div>

                </div>
              )}

            </div>
          </section>

          {/* ==================================================
              SUMMARY CARDS
              STILL PREVIEW DATA FOR NOW
          ================================================== */}

          <section className="caregiver-summary-grid">

            <div className="caregiver-summary-card">

              <div className="caregiver-summary-card__top">

                <div className="caregiver-summary-icon caregiver-summary-icon--blue">
                  <FaPills />
                </div>

                <span className="caregiver-summary-trend">
                  <FaArrowUp />
                  92%
                </span>

              </div>

              <span className="caregiver-summary-label">
                Medication Adherence
              </span>

              <strong className="caregiver-summary-value">
                92%
              </strong>

              <div className="caregiver-progress">
                <i style={{ width: "92%" }} />
              </div>

              <small>
                Preview data — will become
                dynamic with Medication feature
              </small>

            </div>

            <div className="caregiver-summary-card">

              <div className="caregiver-summary-card__top">

                <div className="caregiver-summary-icon caregiver-summary-icon--purple">
                  <FaBrain />
                </div>

                <span className="caregiver-summary-trend">
                  <FaArrowUp />
                  6%
                </span>

              </div>

              <span className="caregiver-summary-label">
                Cognitive Activity
              </span>

              <strong className="caregiver-summary-value">
                81%
              </strong>

              <div className="caregiver-progress caregiver-progress--purple">
                <i style={{ width: "81%" }} />
              </div>

              <small>
                Preview data — will become
                dynamic with Cognitive feature
              </small>

            </div>

            <div className="caregiver-summary-card">

              <div className="caregiver-summary-card__top">

                <div className="caregiver-summary-icon caregiver-summary-icon--green">
                  <FaCalendarAlt />
                </div>

                <span className="caregiver-summary-number">
                  2
                </span>

              </div>

              <span className="caregiver-summary-label">
                Upcoming Appointments
              </span>

              <strong className="caregiver-summary-value">
                2
              </strong>

              <small>
                Preview data — will become
                dynamic with Appointment feature
              </small>

            </div>

            <div className="caregiver-summary-card">

              <div className="caregiver-summary-card__top">

                <div className="caregiver-summary-icon caregiver-summary-icon--orange">
                  <FaBell />
                </div>

                <span className="caregiver-summary-number caregiver-summary-number--danger">
                  2
                </span>

              </div>

              <span className="caregiver-summary-label">
                Active Alerts
              </span>

              <strong className="caregiver-summary-value">
                2
              </strong>

              <small>
                Preview data — will become
                dynamic with Alert feature
              </small>

            </div>

          </section>

          {/* ==================================================
              TWO COLUMN SECTION
          ================================================== */}

          <section className="caregiver-dashboard-grid">

            {/* ==================================================
                AI DETECTION
            ================================================== */}

            <div className="caregiver-panel">

              <div className="caregiver-panel-header">

                <div>
                  <span>
                    DEEP LEARNING ANALYSIS
                  </span>

                  <h2>
                    AI Detection Summary
                  </h2>
                </div>

                <div className="caregiver-ai-badge">
                  <FaBrain />
                  CNN
                </div>

              </div>

              <div className="caregiver-ai-result">

                <div className="caregiver-ai-scan">
                  <FaBrain />
                  <span>MRI</span>
                </div>

                <div className="caregiver-ai-result-info">
                  <span>Preview Prediction</span>

                  <h3>
                    Mild Alzheimer's
                  </h3>

                  <p>
                    MRI Brain Scan
                    <span>•</span>
                    Preview
                  </p>
                </div>

                <div className="caregiver-confidence">

                  <div
                    className="caregiver-confidence-circle"
                    style={{
                      "--confidence":
                        "331.2deg",
                    }}
                  >
                    <strong>
                      92%
                    </strong>

                    <span>
                      Confidence
                    </span>
                  </div>

                </div>
              </div>

              <button
                className="caregiver-primary-button caregiver-primary-button--full"
                onClick={() =>
                  handleAction(
                    "View Full Report"
                  )
                }
              >
                <FaFileMedical />
                View Full Report
              </button>

            </div>

            {/* ==================================================
                LOCATION
            ================================================== */}

            <div className="caregiver-panel">

              <div className="caregiver-panel-header">

                <div>
                  <span>PATIENT SAFETY</span>
                  <h2>Location Status</h2>
                </div>

                <span className="caregiver-location-live">
                  <i />
                  GPS Active
                </span>

              </div>

              <div className="caregiver-location-card">

                <div className="caregiver-location-map">

                  <div className="caregiver-map-grid" />

                  <div className="caregiver-map-pulse">
                    <span>
                      <FaMapMarkerAlt />
                    </span>
                  </div>

                  <div className="caregiver-safe-zone">
                    Safe Zone
                  </div>

                </div>

                <div className="caregiver-location-info">

                  <div>
                    <span>
                      LAST UPDATED
                    </span>

                    <strong>
                      Preview
                    </strong>
                  </div>

                  <div>
                    <span>STATUS</span>

                    <strong className="caregiver-location-safe">
                      Preview
                    </strong>
                  </div>

                </div>

              </div>

              <button
                className="caregiver-outline-button caregiver-outline-button--full"
                onClick={() =>
                  handleAction(
                    "View Live Location"
                  )
                }
              >
                <FaMapMarkerAlt />
                View Live Location
              </button>

            </div>

          </section>

          {/* ==================================================
              MEDICATION + APPOINTMENTS
          ================================================== */}

          <section className="caregiver-dashboard-grid">

            {/* MEDICATIONS */}

            <div className="caregiver-panel">

              <div className="caregiver-panel-header">

                <div>
                  <span>
                    TODAY'S SCHEDULE
                  </span>

                  <h2>
                    Medications
                  </h2>
                </div>

                <button
                  className="caregiver-small-action"
                  onClick={() =>
                    handleAction(
                      "Add Medication"
                    )
                  }
                >
                  <FaPlus />
                  Add
                </button>

              </div>

              <div className="caregiver-medication-list">

                {[
                  {
                    name: "Donepezil",
                    dosage: "5 mg",
                    time: "08:00 AM",
                    status: "Taken",
                  },
                  {
                    name: "Memantine",
                    dosage: "10 mg",
                    time: "01:00 PM",
                    status: "Pending",
                  },
                  {
                    name: "Vitamin B12",
                    dosage: "500 mcg",
                    time: "08:00 PM",
                    status: "Pending",
                  },
                ].map((medicine) => (
                  <div
                    className="caregiver-medication-item"
                    key={`${medicine.name}-${medicine.time}`}
                  >

                    <div className="caregiver-medication-icon">
                      <FaPills />
                    </div>

                    <div className="caregiver-medication-info">
                      <strong>
                        {medicine.name}
                      </strong>

                      <span>
                        {medicine.dosage}
                        <i>•</i>
                        {medicine.time}
                      </span>
                    </div>

                    <span
                      className={`caregiver-medication-status ${
                        medicine.status ===
                        "Taken"
                          ? "caregiver-medication-status--taken"
                          : "caregiver-medication-status--pending"
                      }`}
                    >
                      {medicine.status ===
                        "Taken" && (
                        <FaCheckCircle />
                      )}

                      {medicine.status}
                    </span>

                  </div>
                ))}

              </div>

              <button
                className="caregiver-text-button"
                onClick={() =>
                  handleAction(
                    "View All Medications"
                  )
                }
              >
                View All Medications
                <FaChevronRight />
              </button>

            </div>

            {/* APPOINTMENTS */}

            <div className="caregiver-panel">

              <div className="caregiver-panel-header">

                <div>
                  <span>UPCOMING</span>

                  <h2>
                    Appointments
                  </h2>
                </div>

                <button
                  className="caregiver-small-action"
                  onClick={() =>
                    handleAction(
                      "Book Appointment"
                    )
                  }
                >
                  <FaPlus />
                  Book
                </button>

              </div>

              <div className="caregiver-appointment-list">

                {[
                  {
                    doctor:
                      doctor?.fullName ||
                      "Dr. Priya Rao",
                    type:
                      "Neurology Follow-up",
                    date:
                      "14 Aug 2026",
                    time:
                      "10:30 AM",
                    status:
                      "Preview",
                  },
                  {
                    doctor:
                      "Dr. Arjun Mehta",
                    type:
                      "Cognitive Assessment",
                    date:
                      "22 Aug 2026",
                    time:
                      "03:00 PM",
                    status:
                      "Preview",
                  },
                ].map((appointment) => (
                  <div
                    className="caregiver-appointment-item"
                    key={`${appointment.doctor}-${appointment.date}`}
                  >

                    <div className="caregiver-appointment-date">
                      <span>
                        {appointment.date.split(
                          " "
                        )[0]}
                      </span>

                      <strong>
                        {appointment.date.split(
                          " "
                        )[1]}
                      </strong>
                    </div>

                    <div className="caregiver-appointment-info">

                      <strong>
                        {appointment.doctor}
                      </strong>

                      <span>
                        {appointment.type}
                      </span>

                      <small>
                        <FaClock />
                        {appointment.time}
                      </small>

                    </div>

                    <span className="caregiver-appointment-status">
                      {appointment.status}
                    </span>

                  </div>
                ))}

              </div>

              <button
                className="caregiver-text-button"
                onClick={() =>
                  handleAction(
                    "View Appointments"
                  )
                }
              >
                View Appointments
                <FaChevronRight />
              </button>

            </div>

          </section>

          {/* ==================================================
              COGNITIVE ASSISTANCE
          ================================================== */}

          <section className="caregiver-panel caregiver-cognitive-panel">

            <div className="caregiver-panel-header">

              <div>
                <span>
                  MEMORY SUPPORT
                </span>

                <h2>
                  Cognitive Assistance
                </h2>

                <p>
                  Keep the patient's mind active
                  with guided cognitive activities.
                </p>
              </div>

              <button
                className="caregiver-outline-button"
                onClick={() =>
                  handleAction(
                    "Cognitive Assistance"
                  )
                }
              >
                Open Activities
                <FaChevronRight />
              </button>

            </div>

            <div className="caregiver-cognitive-grid">

              {[
                {
                  name:
                    "Memory Games",
                  icon:
                    <FaBrain />,
                  score: 82,
                },
                {
                  name:
                    "Attention Games",
                  icon:
                    <FaChartLine />,
                  score: 74,
                },
                {
                  name:
                    "Word Games",
                  icon:
                    <FaGamepad />,
                  score: 88,
                },
              ].map((activity) => (
                <div
                  className="caregiver-cognitive-card"
                  key={activity.name}
                >

                  <div className="caregiver-cognitive-icon">
                    {activity.icon}
                  </div>

                  <div className="caregiver-cognitive-info">
                    <strong>
                      {activity.name}
                    </strong>

                    <span>
                      Preview score
                    </span>
                  </div>

                  <div className="caregiver-cognitive-score">

                    <strong>
                      {activity.score}%
                    </strong>

                    <div>
                      <i
                        style={{
                          width: `${activity.score}%`,
                        }}
                      />
                    </div>

                  </div>

                </div>
              ))}

            </div>
          </section>

          {/* ==================================================
              ALERTS + ACTIVITY
          ================================================== */}

          <section className="caregiver-dashboard-grid caregiver-dashboard-grid--alerts">

            {/* ALERTS */}

            <div className="caregiver-panel">

              <div className="caregiver-panel-header">

                <div>
                  <span>
                    ATTENTION REQUIRED
                  </span>

                  <h2>
                    Emergency & Alerts
                  </h2>
                </div>

                <span className="caregiver-alert-count">
                  Preview
                </span>

              </div>

              <div className="caregiver-alert-list">

                {[
                  {
                    type:
                      "Critical",
                    title:
                      "Patient left safe zone",
                    description:
                      "Location alert preview.",
                    time:
                      "Preview",
                  },
                  {
                    type:
                      "Warning",
                    title:
                      "Medication pending",
                    description:
                      "Medication reminder preview.",
                    time:
                      "Preview",
                  },
                  {
                    type:
                      "Information",
                    title:
                      "Doctor updated patient record",
                    description:
                      "Doctor update preview.",
                    time:
                      "Preview",
                  },
                ].map((alert) => (
                  <div
                    className={`caregiver-alert caregiver-alert--${alert.type.toLowerCase()}`}
                    key={alert.title}
                  >

                    <div className="caregiver-alert-icon">

                      {alert.type ===
                      "Critical" ? (
                        <FaExclamationTriangle />
                      ) : alert.type ===
                        "Warning" ? (
                        <FaClock />
                      ) : (
                        <FaBell />
                      )}

                    </div>

                    <div className="caregiver-alert-content">

                      <div>
                        <strong>
                          {alert.title}
                        </strong>

                        <span>
                          {alert.type}
                        </span>
                      </div>

                      <p>
                        {alert.description}
                      </p>

                      <small>
                        {alert.time}
                      </small>

                    </div>

                  </div>
                ))}

              </div>

              <button
                className="caregiver-text-button"
                onClick={() =>
                  handleAction(
                    "View All Alerts"
                  )
                }
              >
                View All Alerts
                <FaChevronRight />
              </button>

            </div>

            {/* RECENT ACTIVITY */}

            <div className="caregiver-panel">

              <div className="caregiver-panel-header">

                <div>
                  <span>
                    PATIENT TIMELINE
                  </span>

                  <h2>
                    Recent Activity
                  </h2>
                </div>

                <button
                  className="caregiver-text-button caregiver-text-button--compact"
                  onClick={() =>
                    handleAction(
                      "View Activity"
                    )
                  }
                >
                  View All
                  <FaChevronRight />
                </button>

              </div>

              <div className="caregiver-timeline">

                {[
                  {
                    icon:
                      <FaPills />,
                    title:
                      "Medication taken",
                    description:
                      "Medication activity preview.",
                    time:
                      "Preview",
                  },
                  {
                    icon:
                      <FaFileMedical />,
                    title:
                      "AI assessment completed",
                    description:
                      "AI assessment preview.",
                    time:
                      "Preview",
                  },
                  {
                    icon:
                      <FaGamepad />,
                    title:
                      "Cognitive activity completed",
                    description:
                      "Cognitive activity preview.",
                    time:
                      "Preview",
                  },
                  {
                    icon:
                      <FaUserMd />,
                    title:
                      "Doctor update",
                    description:
                      "Doctor activity preview.",
                    time:
                      "Preview",
                  },
                ].map(
                  (activity, index, array) => (
                    <div
                      className="caregiver-timeline-item"
                      key={activity.title}
                    >

                      <div className="caregiver-timeline-icon">
                        {activity.icon}
                      </div>

                      <div className="caregiver-timeline-content">

                        <strong>
                          {activity.title}
                        </strong>

                        <p>
                          {activity.description}
                        </p>

                        <span>
                          {activity.time}
                        </span>

                      </div>

                      {index !==
                        array.length - 1 && (
                        <div className="caregiver-timeline-line" />
                      )}

                    </div>
                  )
                )}

              </div>
            </div>

          </section>

          {/* ==================================================
              DOCTOR INFORMATION
          ================================================== */}

          <section className="caregiver-panel caregiver-doctor-panel">

            <div className="caregiver-doctor-profile">

              <div className="caregiver-doctor-avatar">
                <FaUserMd />
              </div>

              <div>
                <span>
                  ASSIGNED DOCTOR
                </span>

                <h2>
                  {doctor?.fullName ||
                    "No doctor assigned"}
                </h2>

                <p>
                  {doctor?.doctorDetails
                    ?.specialization ||
                    "Doctor information will appear here once assigned."}
                  {doctor?.doctorDetails
                    ?.hospital
                    ? ` · ${doctor.doctorDetails.hospital}`
                    : ""}
                </p>
              </div>

            </div>

            <div className="caregiver-doctor-meta">

              <div>
                <span>
                  Specialization
                </span>

                <strong>
                  {doctor
                    ?.doctorDetails
                    ?.specialization ||
                    "Not assigned"}
                </strong>
              </div>

              <div>
                <span>
                  Hospital / Clinic
                </span>

                <strong>
                  {doctor
                    ?.doctorDetails
                    ?.hospital ||
                    "Not assigned"}
                </strong>
              </div>

              <div>
                <span>
                  Contact
                </span>

                <strong>
                  {doctor?.phone ||
                    "Not available"}
                </strong>
              </div>

            </div>

            {doctor && (
              <button
                className="caregiver-primary-button"
                onClick={() =>
                  handleAction(
                    "Contact Doctor"
                  )
                }
              >
                Contact Doctor
              </button>
            )}

          </section>

          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

          <section className="caregiver-section caregiver-quick-section">

            <div className="caregiver-section-heading">

              <div>
                <span>
                  SHORTCUTS
                </span>

                <h2>
                  Quick Actions
                </h2>
              </div>

            </div>

            <div className="caregiver-quick-grid">

              <button
                className="caregiver-quick-card caregiver-quick-card--blue"
                onClick={() =>
                  handleAction(
                    "Upload MRI/CT"
                  )
                }
              >
                <FaFileMedical />

                <div>
                  <strong>
                    Upload MRI/CT
                  </strong>

                  <span>
                    Start AI analysis
                  </span>
                </div>

                <FaChevronRight />
              </button>

              <button
                className="caregiver-quick-card caregiver-quick-card--purple"
                onClick={() =>
                  handleAction(
                    "Add Medication"
                  )
                }
              >
                <FaPills />

                <div>
                  <strong>
                    Add Medication
                  </strong>

                  <span>
                    Manage medicines
                  </span>
                </div>

                <FaChevronRight />
              </button>

              <button
                className="caregiver-quick-card caregiver-quick-card--green"
                onClick={() =>
                  handleAction(
                    "Book Appointment"
                  )
                }
              >
                <FaCalendarAlt />

                <div>
                  <strong>
                    Book Appointment
                  </strong>

                  <span>
                    Schedule doctor visit
                  </span>
                </div>

                <FaChevronRight />
              </button>

              <button
                className="caregiver-quick-card caregiver-quick-card--orange"
                onClick={() =>
                  handleAction(
                    "Start Cognitive Activity"
                  )
                }
              >
                <FaGamepad />

                <div>
                  <strong>
                    Cognitive Activity
                  </strong>

                  <span>
                    Start an exercise
                  </span>
                </div>

                <FaChevronRight />
              </button>

            </div>

          </section>
        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="caregiver-dashboard-footer">

          <span>
            © 2026 AlzCare AI
          </span>

          <span>
            AI-assisted healthcare platform
          </span>

          <span>
            Your patient's privacy and safety matter.
          </span>

        </footer>

      </main>
    </div>
  );
};

export default CaregiverDashboard;