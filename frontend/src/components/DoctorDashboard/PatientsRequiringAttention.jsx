import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

import "./ListCard.css";

/* ============================================================
   PATIENTS REQUIRING ATTENTION

   There is no dedicated backend endpoint that returns the LIST
   of patients needing attention — only a count
   (getDoctorPatientsNeedingAttention). This component derives
   the list itself from data already loaded by the dashboard:
   for each real patient, it finds that patient's most recent
   real assessment (from getDoctorAssessments()) and flags them
   if the prediction is "Mild Dementia" or "Moderate Dementia" —
   the same definition the existing AI Reports page already uses
   to label a result "Requires Review". No value here is
   invented; this only re-reads already-fetched real data.
============================================================ */

const ATTENTION_PREDICTIONS = ["Mild Dementia", "Moderate Dementia"];

const predictionBadgeClass = (prediction) =>
  prediction === "Moderate Dementia"
    ? "list-card__badge--red"
    : "list-card__badge--orange";

const PatientsRequiringAttention = ({
  patients = [],
  assessments = [],
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const latestAssessmentByPatient = new Map();

  [...assessments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((assessment) => {
      const patientId = assessment.patientId?._id || assessment.patientId;
      if (patientId && !latestAssessmentByPatient.has(patientId)) {
        latestAssessmentByPatient.set(patientId, assessment);
      }
    });

  const flagged = patients
    .map((patient) => ({
      patient,
      assessment: latestAssessmentByPatient.get(patient._id),
    }))
    .filter(
      (entry) =>
        entry.assessment &&
        ATTENTION_PREDICTIONS.includes(entry.assessment.prediction)
    )
    .slice(0, 6);

  return (
    <div className="list-card">
      <div className="list-card__header">
        <div>
          <span>FLAGGED BY LATEST AI ASSESSMENT</span>
          <h2>Patients Requiring Attention</h2>
        </div>
      </div>

      {isLoading ? (
        <div className="list-card__state">Loading...</div>
      ) : flagged.length === 0 ? (
        <div className="list-card__state">
          No patients are currently flagged for attention.
        </div>
      ) : (
        <div className="list-card__items">
          {flagged.map(({ patient, assessment }) => (
            <div className="list-card__item" key={patient._id}>
              <div className="list-card__avatar" style={{ color: "#b45309" }}>
                <FaExclamationTriangle />
              </div>

              <div className="list-card__item-body">
                <strong>{patient.fullName}</strong>
                <span>
                  Latest:{" "}
                  {new Date(assessment.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>

              <span
                className={`list-card__badge ${predictionBadgeClass(
                  assessment.prediction
                )}`}
              >
                {assessment.prediction}
              </span>

              <button
                type="button"
                className="list-card__button"
                onClick={() => navigate(`/doctor/patients/${patient._id}`)}
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientsRequiringAttention;
