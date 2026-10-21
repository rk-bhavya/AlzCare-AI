import { useEffect, useState } from "react";
import { FaHistory, FaSpinner } from "react-icons/fa";

import { getCaregiverPatientDetails } from "../../api/caregiver.api.js";

/* ============================================================
   ASSESSMENT HISTORY

   Lets the caregiver pick one of their assigned patients and
   see that patient's full assessment history. Reuses the
   existing getCaregiverPatientDetails(patientId) endpoint,
   which already returns an `assessments` array (used today by
   the Caregiver Patient Details page) — no new endpoint, no
   invented data.
============================================================ */

const predictionBadgeClass = (prediction) => {
  if (prediction === "Non Demented") return "cg-badge--green";
  if (prediction === "Moderate Dementia") return "cg-badge--red";
  if (prediction === "Mild Dementia") return "cg-badge--orange";
  return "cg-badge--orange";
};

const AssessmentHistory = ({ patients = [] }) => {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients]);

  useEffect(() => {
    if (!selectedPatientId) return;

    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getCaregiverPatientDetails(selectedPatientId);
        setHistory(response.assessments || []);
      } catch (err) {
        console.error("Unable to load assessment history:", err);
        setError(
          err.response?.data?.message || "Unable to load assessment history."
        );
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [selectedPatientId]);

  if (patients.length === 0) {
    return null;
  }

  return (
    <div className="cg-card">
      <div className="cg-card__header">
        <div>
          <span>HISTORY</span>
          <h2>Assessment History</h2>
        </div>
        <FaHistory />
      </div>

      <div className="cg-field" style={{ maxWidth: 280, marginBottom: 16 }}>
        <label>Patient</label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
        >
          {patients.map((patient) => (
            <option key={patient._id} value={patient._id}>
              {patient.fullName}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="cg-state">
          <FaSpinner className="appointment-spinner" />
          Loading history...
        </div>
      ) : error ? (
        <div className="cg-state cg-state--error">{error}</div>
      ) : history.length === 0 ? (
        <div className="cg-state">
          <strong>No assessments recorded yet for this patient.</strong>
        </div>
      ) : (
        <div className="cg-table-wrapper">
          <table className="cg-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Result</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {history.map((assessment) => (
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
                  <td>
                    {typeof assessment.confidence === "number"
                      ? `${assessment.confidence.toFixed(1)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssessmentHistory;
