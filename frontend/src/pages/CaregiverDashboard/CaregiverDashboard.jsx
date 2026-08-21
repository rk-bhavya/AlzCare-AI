import { useEffect, useState } from "react";

import {
  FaBell,
  FaCalendarAlt,
  FaChevronRight,
  FaClock,
  FaHeartbeat,
  FaMapMarkerAlt,
  FaPills,
  FaUser,
  FaUserMd,
  FaBrain,
  FaGamepad,
  FaExclamationTriangle,
  FaFileMedical,
  FaPlus,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import {
  getCaregiverDashboard,
  getCaregiverDashboardSummary,
} from "../../api/caregiver.api.js";

import { markMedicationTaken } from "../../api/medication.api.js";

import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

import "./CaregiverDashboard.css";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

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

const formatTime12h = (time24) => {
  if (!time24) return "—";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const CaregiverDashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [markingKey, setMarkingKey] = useState("");

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [dashboard, summary] = await Promise.all([
        getCaregiverDashboard(),
        getCaregiverDashboardSummary(),
      ]);

      setDashboardData(dashboard);
      setSummaryData(summary);
    } catch (err) {
      console.error("Caregiver dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your dashboard. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleMarkTaken = async (medicationId, time) => {
    const key = `${medicationId}_${time}`;

    try {
      setMarkingKey(key);

      await markMedicationTaken(medicationId, time);

      const summary = await getCaregiverDashboardSummary();
      setSummaryData(summary);
    } catch (err) {
      console.error("Unable to mark medication as taken:", err);
    } finally {
      setMarkingKey("");
    }
  };

  const caregiver = dashboardData?.caregiver || null;
  const patient = dashboardData?.patient || null;
  const doctor = dashboardData?.doctor || null;

  const caregiverName = caregiver?.fullName || "Caregiver";
  const patientInitials = patient ? getInitials(patient.fullName) : "—";

  const summary = summaryData?.summary || {
    patientCount: 0,
    todaysMedicationCount: 0,
    todaysAppointmentCount: 0,
    activeAlertCount: 0,
  };

  const todaysMedications = summaryData?.todaysMedications || [];
  const todaysAppointments = summaryData?.todaysAppointments || [];
  const alerts = summaryData?.alerts || [];

  if (isLoading) {
    return (
      <div className="caregiver-dashboard caregiver-dashboard--loading">
        <div className="caregiver-dashboard-loader">
          <div className="caregiver-dashboard-loader__icon">
            <FaBrain />
          </div>
          <h2>Loading your dashboard...</h2>
          <p>Preparing your caregiver portal.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="caregiver-dashboard caregiver-dashboard--loading">
        <div className="caregiver-dashboard-loader">
          <div className="caregiver-dashboard-loader__icon caregiver-dashboard-loader__icon--error">
            <FaExclamationTriangle />
          </div>
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
          <button className="caregiver-primary-button" onClick={loadDashboard}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <CaregiverPageLayout
      activePage="Dashboard"
      eyebrow="Caregiver Dashboard"
      title={`Good morning, ${caregiverName.split(" ")[0]}!`}
      subtitle="Here's what's happening with your patient today."
    >
      {/* PATIENT OVERVIEW */}
      <section className="caregiver-section">
        <div className="caregiver-section-heading">
          <div>
            <span>PRIMARY PATIENT</span>
            <h2>Patient Overview</h2>
          </div>

          {patient && (
            <button
              className="caregiver-outline-button"
              onClick={() => navigate(`/caregiver/patients/${patient._id}`)}
            >
              View Patient
              <FaChevronRight />
            </button>
          )}
        </div>

        <div className="caregiver-patient-overview">
          {patient ? (
            <>
              <div className="caregiver-patient-main">
                <div className="caregiver-patient-avatar">
                  {patientInitials}
                </div>

                <div className="caregiver-patient-details">
                  <h3>{patient.fullName}</h3>
                  <p>
                    {patient.age} years<span>•</span>
                    {patient.gender}
                  </p>
                </div>
              </div>

              <div className="caregiver-patient-info">
                <div>
                  <span>EMAIL</span>
                  <strong>{patient.email}</strong>
                </div>

                <div>
                  <span>PHONE</span>
                  <strong>{patient.phone}</strong>
                </div>

                <div>
                  <span>EMERGENCY CONTACT</span>
                  <strong>
                    {patient.emergencyContact || "Not available"}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <div className="caregiver-no-patient">
              <div className="caregiver-no-patient__icon">
                <FaUser />
              </div>

              <div>
                <h3>No patient assigned yet</h3>
                <p>
                  Your patient's information will appear here once a
                  doctor assigns a patient to your care.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <section className="caregiver-summary-grid">
        <div className="caregiver-summary-card">
          <div className="caregiver-summary-card__top">
            <div className="caregiver-summary-icon caregiver-summary-icon--blue">
              <FaUser />
            </div>
          </div>
          <span className="caregiver-summary-label">My Patients</span>
          <strong className="caregiver-summary-value">
            {summary.patientCount}
          </strong>
          <small>Patients currently assigned to you</small>
        </div>

        <div className="caregiver-summary-card">
          <div className="caregiver-summary-card__top">
            <div className="caregiver-summary-icon caregiver-summary-icon--purple">
              <FaPills />
            </div>
          </div>
          <span className="caregiver-summary-label">Today's Medications</span>
          <strong className="caregiver-summary-value">
            {summary.todaysMedicationCount}
          </strong>
          <small>Doses scheduled for today</small>
        </div>

        <div className="caregiver-summary-card">
          <div className="caregiver-summary-card__top">
            <div className="caregiver-summary-icon caregiver-summary-icon--green">
              <FaCalendarAlt />
            </div>
          </div>
          <span className="caregiver-summary-label">
            Today's Appointments
          </span>
          <strong className="caregiver-summary-value">
            {summary.todaysAppointmentCount}
          </strong>
          <small>Scheduled for today</small>
        </div>

        <div className="caregiver-summary-card">
          <div className="caregiver-summary-card__top">
            <div className="caregiver-summary-icon caregiver-summary-icon--orange">
              <FaBell />
            </div>
          </div>
          <span className="caregiver-summary-label">Active Alerts</span>
          <strong className="caregiver-summary-value">
            {summary.activeAlertCount}
          </strong>
          <small>Unread notifications</small>
        </div>
      </section>

      {/* MEDICATIONS + APPOINTMENTS */}
      <section className="caregiver-dashboard-grid">
        <div className="caregiver-panel">
          <div className="caregiver-panel-header">
            <div>
              <span>TODAY'S SCHEDULE</span>
              <h2>Medications</h2>
            </div>

            <button
              className="caregiver-small-action"
              onClick={() => navigate("/caregiver/medications")}
            >
              <FaPlus />
              Add
            </button>
          </div>

          {todaysMedications.length === 0 ? (
            <div className="cg-state">
              <FaPills />
              <strong>No medications today</strong>
              <span>Add a medication schedule to see it here.</span>
            </div>
          ) : (
            <div className="caregiver-medication-list">
              {todaysMedications.slice(0, 4).map((med) => {
                const key = `${med.medicationId}_${med.time}`;
                const isMarking = markingKey === key;

                return (
                  <div className="caregiver-medication-item" key={key}>
                    <div className="caregiver-medication-icon">
                      <FaPills />
                    </div>

                    <div className="caregiver-medication-info">
                      <strong>{med.name}</strong>
                      <span>
                        {med.dosage}
                        <i>•</i>
                        {formatTime12h(med.time)}
                      </span>
                    </div>

                    {med.status === "taken" ? (
                      <span className="caregiver-medication-status caregiver-medication-status--taken">
                        <FaCheckCircle />
                        Taken
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={`caregiver-medication-status ${
                          med.status === "missed"
                            ? "caregiver-medication-status--pending"
                            : "caregiver-medication-status--pending"
                        }`}
                        disabled={isMarking}
                        onClick={() =>
                          handleMarkTaken(med.medicationId, med.time)
                        }
                        style={{ cursor: "pointer", border: "none" }}
                      >
                        {isMarking ? (
                          <FaSpinner className="appointment-spinner" />
                        ) : med.status === "missed" ? (
                          "Missed — Mark Taken"
                        ) : (
                          "Mark as Taken"
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button
            className="caregiver-text-button"
            onClick={() => navigate("/caregiver/medications")}
          >
            View All Medications
            <FaChevronRight />
          </button>
        </div>

        <div className="caregiver-panel">
          <div className="caregiver-panel-header">
            <div>
              <span>TODAY</span>
              <h2>Appointments</h2>
            </div>
          </div>

          {todaysAppointments.length === 0 ? (
            <div className="cg-state">
              <FaCalendarAlt />
              <strong>No appointments today</strong>
              <span>Today's scheduled appointments will appear here.</span>
            </div>
          ) : (
            <div className="caregiver-appointment-list">
              {todaysAppointments.slice(0, 4).map((appointment) => (
                <div
                  className="caregiver-appointment-item"
                  key={appointment._id}
                >
                  <div className="caregiver-appointment-date">
                    <span>
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                    <strong>
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString("en-IN", { day: "2-digit" })}
                    </strong>
                  </div>

                  <div className="caregiver-appointment-info">
                    <strong>
                      {appointment.doctorId?.fullName || "Doctor"}
                    </strong>
                    <span>{appointment.type}</span>
                    <small>
                      <FaClock />
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </small>
                  </div>

                  <span className="caregiver-appointment-status">
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            className="caregiver-text-button"
            onClick={() => navigate("/caregiver/appointments")}
          >
            View Appointments
            <FaChevronRight />
          </button>
        </div>
      </section>

      {/* RECENT ALERTS */}
      <section className="caregiver-panel">
        <div className="caregiver-panel-header">
          <div>
            <span>ATTENTION REQUIRED</span>
            <h2>Recent Alerts</h2>
          </div>

          <span className="caregiver-alert-count">
            {summary.activeAlertCount}
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="cg-state">
            <FaCheckCircle />
            <strong>No active alerts</strong>
            <span>You're all caught up.</span>
          </div>
        ) : (
          <div className="caregiver-alert-list">
            {alerts.slice(0, 4).map((alert) => {
              const alertVariant =
                alert.type === "critical" || alert.type === "warning"
                  ? alert.type
                  : "information";

              return (
              <div
                className={`caregiver-alert caregiver-alert--${alertVariant}`}
                key={alert._id}
              >
                <div className="caregiver-alert-icon">
                  {alert.type === "critical" || alert.type === "warning" ? (
                    <FaExclamationTriangle />
                  ) : (
                    <FaBell />
                  )}
                </div>

                <div className="caregiver-alert-content">
                  <div>
                    <strong>{alert.title}</strong>
                    <span>{alert.type}</span>
                  </div>

                  <p>{alert.message}</p>

                  <small>{formatRelativeTime(alert.createdAt)}</small>
                </div>
              </div>
              );
            })}
          </div>
        )}

        <button
          className="caregiver-text-button"
          onClick={() => navigate("/caregiver/notifications")}
        >
          View All Alerts
          <FaChevronRight />
        </button>
      </section>

      {/* DOCTOR INFORMATION */}
      <section className="caregiver-panel caregiver-doctor-panel">
        <div className="caregiver-doctor-profile">
          <div className="caregiver-doctor-avatar">
            <FaUserMd />
          </div>

          <div>
            <span>ASSIGNED DOCTOR</span>
            <h2>{doctor?.fullName || "No doctor assigned"}</h2>
            <p>
              {doctor?.doctorDetails?.specialization ||
                "Doctor information will appear here once assigned."}
              {doctor?.doctorDetails?.hospital
                ? ` · ${doctor.doctorDetails.hospital}`
                : ""}
            </p>
          </div>
        </div>

        {doctor && (
          <button
            className="caregiver-primary-button"
            onClick={() => navigate("/caregiver/messages")}
          >
            Message Doctor
          </button>
        )}
      </section>

      {/* QUICK ACTIONS — BOTTOM, HORIZONTAL ON DESKTOP */}
      <section className="caregiver-section caregiver-quick-section">
        <div className="caregiver-section-heading">
          <div>
            <span>SHORTCUTS</span>
            <h2>Quick Actions</h2>
          </div>
        </div>

        <div className="caregiver-quick-grid">
          {patient && (
            <button
              className="caregiver-quick-card caregiver-quick-card--blue"
              onClick={() => navigate(`/caregiver/patients/${patient._id}`)}
            >
              <FaFileMedical />
              <div>
                <strong>View Patient</strong>
                <span>Open patient profile</span>
              </div>
              <FaChevronRight />
            </button>
          )}

          <button
            className="caregiver-quick-card caregiver-quick-card--purple"
            onClick={() => navigate("/caregiver/medications")}
          >
            <FaPills />
            <div>
              <strong>Add Medication</strong>
              <span>Manage medicines</span>
            </div>
            <FaChevronRight />
          </button>

          <button
            className="caregiver-quick-card caregiver-quick-card--green"
            onClick={() => navigate("/caregiver/appointments")}
          >
            <FaCalendarAlt />
            <div>
              <strong>Appointments</strong>
              <span>View schedule</span>
            </div>
            <FaChevronRight />
          </button>

          <button
            className="caregiver-quick-card caregiver-quick-card--orange"
            onClick={() => navigate("/caregiver/notifications")}
          >
            <FaBell />
            <div>
              <strong>Alerts</strong>
              <span>Review notifications</span>
            </div>
            <FaChevronRight />
          </button>

          <button
            className="caregiver-quick-card caregiver-quick-card--blue"
            onClick={() => navigate("/caregiver/messages")}
          >
            <FaUserMd />
            <div>
              <strong>Message Doctor</strong>
              <span>Contact care team</span>
            </div>
            <FaChevronRight />
          </button>

          <button
            className="caregiver-quick-card caregiver-quick-card--purple"
            onClick={() => navigate("/caregiver/cognitive")}
          >
            <FaGamepad />
            <div>
              <strong>Cognitive Assistance</strong>
              <span>Start an activity</span>
            </div>
            <FaChevronRight />
          </button>
        </div>
      </section>
    </CaregiverPageLayout>
  );
};

export default CaregiverDashboard;
