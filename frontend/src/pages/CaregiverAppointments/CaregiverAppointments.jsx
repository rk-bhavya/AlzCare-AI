import { useEffect, useMemo, useState } from "react";

import {
  FaCalendarAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaClock,
  FaUserMd,
  FaSyncAlt,
} from "react-icons/fa";

import { getCaregiverAppointments } from "../../api/appointment.api.js";
import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

const FILTERS = ["all", "scheduled", "completed", "cancelled"];

const statusBadgeClass = (status) => {
  if (status === "completed") return "cg-badge--green";
  if (status === "cancelled") return "cg-badge--red";
  if (status === "rescheduled") return "cg-badge--orange";
  return "cg-badge--blue";
};

const CaregiverAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getCaregiverAppointments();
      setAppointments(response.appointments || []);
    } catch (err) {
      console.error("Unable to load appointments:", err);
      setError(
        err.response?.data?.message || "Unable to load appointments."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (filter === "all") return appointments;
    return appointments.filter((appt) => appt.status === filter);
  }, [appointments, filter]);

  return (
    <CaregiverPageLayout
      activePage="Appointments"
      eyebrow="Care Schedule"
      title="Appointments"
      subtitle="Appointments for every patient assigned to your care."
    >
      <div className="cg-card">
        <div className="cg-card__header">
          <div>
            <span>SCHEDULE</span>
            <h2>Appointments</h2>
          </div>

          <button
            type="button"
            className="cg-btn cg-btn--outline cg-btn--sm"
            onClick={loadAppointments}
          >
            <FaSyncAlt />
            Refresh
          </button>
        </div>

        <div className="cg-toolbar">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              className={`cg-btn cg-btn--sm ${
                filter === option ? "cg-btn--primary" : "cg-btn--outline"
              }`}
              onClick={() => setFilter(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="cg-state">
            <FaSpinner className="appointment-spinner" />
            Loading appointments...
          </div>
        ) : error ? (
          <div className="cg-state cg-state--error">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button
              className="cg-btn cg-btn--outline cg-btn--sm"
              onClick={loadAppointments}
            >
              Retry
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="cg-state">
            <FaCalendarAlt />
            <strong>No appointments found</strong>
            <span>
              {filter === "all"
                ? "No appointments have been scheduled yet."
                : `No ${filter} appointments.`}
            </span>
          </div>
        ) : (
          <div className="cg-table-wrapper">
            <table className="cg-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appt) => (
                  <tr key={appt._id}>
                    <td>
                      <div className="cg-name-cell">
                        <div>
                          <strong>{appt.patientId?.fullName || "—"}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <FaUserMd style={{ marginRight: 6, color: "#8b96ab" }} />
                      {appt.doctorId?.fullName || "—"}
                    </td>
                    <td>
                      <FaClock style={{ marginRight: 6, color: "#8b96ab" }} />
                      {new Date(appt.appointmentDate).toLocaleString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </td>
                    <td>{appt.type}</td>
                    <td>
                      <span
                        className={`cg-badge ${statusBadgeClass(
                          appt.status
                        )}`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td>{appt.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CaregiverPageLayout>
  );
};

export default CaregiverAppointments;
