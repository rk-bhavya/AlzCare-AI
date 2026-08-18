import { useEffect, useState } from "react";

import {
  FaHeartbeat,
  FaSpinner,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaBrain,
  FaBell,
  FaSyncAlt,
  FaClock,
} from "react-icons/fa";

import { getCaregiverMonitoring } from "../../api/caregiver.api.js";
import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const CaregiverMonitoring = () => {
  const [monitoring, setMonitoring] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMonitoring = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getCaregiverMonitoring();
      setMonitoring(response.monitoring || []);
    } catch (err) {
      console.error("Unable to load monitoring data:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load patient monitoring information."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoring();
  }, []);

  return (
    <CaregiverPageLayout
      activePage="Patient Monitoring"
      eyebrow="Safety & Wellbeing"
      title="Patient Monitoring"
      subtitle="Live status information for your assigned patients."
    >
      <div className="cg-card">
        <div className="cg-card__header">
          <div>
            <span>MONITORING</span>
            <h2>Patient Status</h2>
          </div>

          <button
            type="button"
            className="cg-btn cg-btn--outline cg-btn--sm"
            onClick={loadMonitoring}
          >
            <FaSyncAlt />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="cg-state">
            <FaSpinner className="appointment-spinner" />
            Loading monitoring data...
          </div>
        ) : error ? (
          <div className="cg-state cg-state--error">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button
              className="cg-btn cg-btn--outline cg-btn--sm"
              onClick={loadMonitoring}
            >
              Retry
            </button>
          </div>
        ) : monitoring.length === 0 ? (
          <div className="cg-state">
            <FaHeartbeat />
            <strong>No patients assigned</strong>
            <span>Monitoring information will appear once a patient is assigned to you.</span>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 18,
            }}
          >
            {monitoring.map((entry) => (
              <div
                key={entry.patient._id}
                className="cg-card"
                style={{ boxShadow: "none", border: "1px solid #e8edf4" }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="cg-avatar-sm" style={{ width: 46, height: 46 }}>
                    {getInitials(entry.patient.fullName) || "P"}
                  </div>
                  <div>
                    <strong style={{ fontSize: 15 }}>
                      {entry.patient.fullName}
                    </strong>
                    <div style={{ fontSize: 12, color: "#8b96ab" }}>
                      {entry.patient.age} yrs • {entry.patient.gender}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      color: "#45506a",
                    }}
                  >
                    <FaMapMarkerAlt style={{ color: "#8b96ab" }} />
                    <span>
                      {entry.location?.status === "unavailable"
                        ? "Location unavailable"
                        : entry.location?.message}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      color: "#45506a",
                    }}
                  >
                    <FaBrain style={{ color: "#8b96ab" }} />
                    <span>
                      {entry.latestAssessment
                        ? `Latest assessment: ${entry.latestAssessment.prediction}`
                        : "No AI assessment on record"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      color: "#45506a",
                    }}
                  >
                    <FaClock style={{ color: "#8b96ab" }} />
                    <span>
                      Last updated:{" "}
                      {entry.lastKnownActivity
                        ? new Date(
                            entry.lastKnownActivity
                          ).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unavailable"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                    }}
                  >
                    <FaBell
                      style={{
                        color:
                          entry.activeAlertCount > 0 ? "#b45309" : "#8b96ab",
                      }}
                    />
                    <span
                      className={`cg-badge ${
                        entry.activeAlertCount > 0
                          ? "cg-badge--orange"
                          : "cg-badge--green"
                      }`}
                    >
                      {entry.activeAlertCount > 0
                        ? `${entry.activeAlertCount} active alert${
                            entry.activeAlertCount === 1 ? "" : "s"
                          }`
                        : "No active alerts"}
                    </span>
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

export default CaregiverMonitoring;
