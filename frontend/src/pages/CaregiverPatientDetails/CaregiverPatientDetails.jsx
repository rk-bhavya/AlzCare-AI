import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaPills,
  FaCalendarAlt,
  FaBell,
  FaBrain,
  FaUserMd,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { getCaregiverPatientDetails } from "../../api/caregiver.api.js";
import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const predictionBadgeClass = (prediction) => {
  if (prediction === "Non Demented") return "cg-badge--green";
  if (prediction === "Moderate Dementia") return "cg-badge--red";
  if (prediction === "Mild Dementia") return "cg-badge--orange";
  return "cg-badge--orange";
};

const CaregiverPatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetails = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getCaregiverPatientDetails(patientId);
      setData(response);
    } catch (err) {
      console.error("Unable to load patient details:", err);
      setError(
        err.response?.data?.message || "Unable to load patient details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const patient = data?.patient;
  const doctor = data?.doctor;
  const assessments = data?.assessments || [];
  const medications = data?.medications || [];
  const appointments = data?.appointments || [];
  const alerts = data?.alerts || [];

  return (
    <CaregiverPageLayout
      activePage="My Patients"
      eyebrow="Patient Management"
      title="Patient Details"
      subtitle="Read-only clinical overview for your assigned patient."
    >
      <button
        type="button"
        className="cg-btn cg-btn--ghost cg-btn--sm"
        style={{ alignSelf: "flex-start" }}
        onClick={() => navigate("/caregiver/patients")}
      >
        <FaArrowLeft />
        Back to My Patients
      </button>

      {isLoading ? (
        <div className="cg-card">
          <div className="cg-state">
            <FaSpinner className="appointment-spinner" />
            Loading patient details...
          </div>
        </div>
      ) : error ? (
        <div className="cg-card">
          <div className="cg-state cg-state--error">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button className="cg-btn cg-btn--outline cg-btn--sm" onClick={loadDetails}>
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* PATIENT PROFILE */}
          <div className="cg-card">
            <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
              <div className="cg-avatar-sm" style={{ width: 64, height: 64, fontSize: 22 }}>
                {getInitials(patient?.fullName) || "P"}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                  {patient?.fullName}
                </h2>
                <p style={{ fontSize: 14, color: "#6b7690" }}>
                  {patient?.age} years • {patient?.gender}
                </p>
              </div>
            </div>

            <div className="cg-form-grid" style={{ marginTop: 20 }}>
              <div className="cg-field">
                <label><FaEnvelope /> Email</label>
                <span>{patient?.email || "—"}</span>
              </div>
              <div className="cg-field">
                <label><FaPhone /> Phone</label>
                <span>{patient?.phone || "—"}</span>
              </div>
              <div className="cg-field cg-field--full">
                <label><FaMapMarkerAlt /> Address</label>
                <span>{patient?.address || "—"}</span>
              </div>
              <div className="cg-field">
                <label>Emergency Contact</label>
                <span>{patient?.emergencyContact || "Not available"}</span>
              </div>
              <div className="cg-field">
                <label><FaUserMd /> Assigned Doctor</label>
                <span>{doctor?.fullName || "Not assigned"}</span>
              </div>
            </div>
          </div>

          {/* LATEST AI ASSESSMENT (READ ONLY) */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>CLINICAL — READ ONLY</span>
                <h2>Latest AI Assessment</h2>
              </div>
              <FaBrain />
            </div>

            {assessments.length === 0 ? (
              <div className="cg-state">
                <FaBrain />
                <strong>No assessments yet</strong>
                <span>AI assessment results will appear here.</span>
              </div>
            ) : (
              <div className="cg-table-wrapper">
                <table className="cg-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Prediction</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((assessment) => (
                      <tr key={assessment._id}>
                        <td>
                          {new Date(assessment.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )}
                        </td>
                        <td>
                          <span
                            className={`cg-badge ${predictionBadgeClass(
                              assessment.prediction
                            )}`}
                          >
                            {assessment.prediction}
                          </span>
                        </td>
                        <td>{assessment.confidence?.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* MEDICATION SCHEDULE */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>CARE PLAN</span>
                <h2>Medication Schedule</h2>
              </div>
              <FaPills />
            </div>

            {medications.length === 0 ? (
              <div className="cg-state">
                <FaPills />
                <strong>No medications added</strong>
                <span>Add medications from the Medications page.</span>
              </div>
            ) : (
              <div className="cg-table-wrapper">
                <table className="cg-table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Times</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((med) => (
                      <tr key={med._id}>
                        <td>{med.name}</td>
                        <td>{med.dosage}</td>
                        <td>{med.frequency}</td>
                        <td>{med.times?.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* APPOINTMENTS */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>SCHEDULE</span>
                <h2>Appointments</h2>
              </div>
              <FaCalendarAlt />
            </div>

            {appointments.length === 0 ? (
              <div className="cg-state">
                <FaCalendarAlt />
                <strong>No appointments</strong>
              </div>
            ) : (
              <div className="cg-table-wrapper">
                <table className="cg-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Doctor</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt._id}>
                        <td>
                          {new Date(appt.appointmentDate).toLocaleString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                        <td>{appt.doctorId?.fullName || "—"}</td>
                        <td>{appt.type}</td>
                        <td>
                          <span className="cg-badge cg-badge--blue">
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ALERTS */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>SAFETY</span>
                <h2>Recent Activity & Alerts</h2>
              </div>
              <FaBell />
            </div>

            {alerts.length === 0 ? (
              <div className="cg-state">
                <FaBell />
                <strong>No recent alerts</strong>
              </div>
            ) : (
              <div className="cg-table-wrapper">
                <table className="cg-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Message</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert._id}>
                        <td>{alert.title}</td>
                        <td>{alert.message}</td>
                        <td>
                          {new Date(alert.createdAt).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </CaregiverPageLayout>
  );
};

export default CaregiverPatientDetails;
