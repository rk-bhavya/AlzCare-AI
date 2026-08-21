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
  FaGamepad,
  FaListUl,
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

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes === 0) return `${remaining} sec`;
  return `${minutes} min ${remaining} sec`;
};

const formatScore = (score) => `${score} / 100`;

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
                      {entry.location?.status === "available"
                        ? `${entry.location.latitude.toFixed(
                            4
                          )}, ${entry.location.longitude.toFixed(4)} · ${new Date(
                            entry.location.updatedAt
                          ).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "Location unavailable"}
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

                  {entry.helpAlerts && entry.helpAlerts.length > 0 && (
                    <div
                      style={{
                        marginTop: 4,
                        padding: 10,
                        borderRadius: 10,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: 12,
                          color: "#b91c1c",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        🆘 Help Requested
                      </strong>
                      {entry.helpAlerts.slice(0, 2).map((alert) => (
                        <div
                          key={alert._id}
                          style={{ fontSize: 12, color: "#7f1d1d" }}
                        >
                          {new Date(alert.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eef1f6" }}>
                    <strong style={{ fontSize: 13 }}>Family Recognition</strong>
                    {!entry.faceRecognitionEvents?.length ? (
                      <p style={{ fontSize: 12, color: "#8b96ab", margin: "6px 0 0" }}>No recognition events yet.</p>
                    ) : entry.faceRecognitionEvents.map((event) => (
                      <div key={event._id} style={{ marginTop: 8, fontSize: 12, color: event.recognized ? "#166534" : "#b45309" }}>
                        <strong>{event.recognized ? `✓ ${event.familyMemberId?.name || "Family member"}` : "⚠ Unknown Person"}</strong>
                        {event.recognized && <span> · {event.familyMemberId?.relationship}</span>}
                        <span style={{ color: "#8b96ab" }}> · {new Date(event.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COGNITIVE PROGRESS */}
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: "1px solid #eef1f6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <FaGamepad style={{ color: "#8b96ab", fontSize: 13 }} />
                    <strong style={{ fontSize: 13 }}>
                      Cognitive Progress
                    </strong>
                  </div>

                  {!entry.cognitiveProgress?.hasActivity ? (
                    <p style={{ fontSize: 13, color: "#8b96ab" }}>
                      No cognitive activities completed yet.
                    </p>
                  ) : (
                    <>
                      <div
                        style={{
                          background: "#f7fbfa",
                          border: "1px solid #eef1f6",
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                            fontSize: 12,
                          }}
                        >
                          <div>
                            <span style={{ color: "#8b96ab" }}>
                              Latest Activity
                            </span>
                            <div style={{ fontWeight: 700, color: "#17233c" }}>
                              {entry.cognitiveProgress.latest.label}
                            </div>
                          </div>

                          <div>
                            <span style={{ color: "#8b96ab" }}>Score</span>
                            <div style={{ fontWeight: 700, color: "#17233c" }}>
                              {formatScore(entry.cognitiveProgress.latest.score)}
                            </div>
                          </div>

                          {entry.cognitiveProgress.latest.durationSeconds !==
                            null && (
                            <div>
                              <span style={{ color: "#8b96ab" }}>Time</span>
                              <div
                                style={{ fontWeight: 700, color: "#17233c" }}
                              >
                                {formatDuration(
                                  entry.cognitiveProgress.latest
                                    .durationSeconds
                                )}
                              </div>
                            </div>
                          )}

                          <div>
                            <span style={{ color: "#8b96ab" }}>
                              Last Activity
                            </span>
                            <div style={{ fontWeight: 700, color: "#17233c" }}>
                              {new Date(
                                entry.cognitiveProgress.latest.createdAt
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#8b96ab",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Recent Progress
                        </span>

                        {entry.cognitiveProgress.recentByType.map((item) => (
                          <div
                            key={item.activityType}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 13,
                              color: "#45506a",
                            }}
                          >
                            <span>{item.label}</span>
                            <strong>{formatScore(item.score)}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* DAILY TASK PROGRESS */}
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: "1px solid #eef1f6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <FaListUl style={{ color: "#8b96ab", fontSize: 13 }} />
                    <strong style={{ fontSize: 13 }}>
                      Daily Task Progress
                    </strong>
                  </div>

                  {!entry.dailyTaskProgress ||
                  entry.dailyTaskProgress.total === 0 ? (
                    <p style={{ fontSize: 13, color: "#8b96ab" }}>
                      No daily tasks configured.
                    </p>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#45506a" }}>
                          {entry.dailyTaskProgress.completed} /{" "}
                          {entry.dailyTaskProgress.total} completed
                        </span>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: 8,
                          borderRadius: 999,
                          background: "#eef1f6",
                          overflow: "hidden",
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            width: `${
                              entry.dailyTaskProgress.total > 0
                                ? (entry.dailyTaskProgress.completed /
                                    entry.dailyTaskProgress.total) *
                                  100
                                : 0
                            }%`,
                            height: "100%",
                            background: "#14b8a6",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: 18 }}>
                        <div>
                          <span
                            style={{ fontSize: 11, color: "#8b96ab" }}
                          >
                            Completed
                          </span>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#15803d",
                            }}
                          >
                            {entry.dailyTaskProgress.completed}
                          </div>
                        </div>

                        <div>
                          <span
                            style={{ fontSize: 11, color: "#8b96ab" }}
                          >
                            Pending
                          </span>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#b45309",
                            }}
                          >
                            {entry.dailyTaskProgress.pending}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
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
