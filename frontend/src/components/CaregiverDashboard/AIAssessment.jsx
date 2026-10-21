import { useNavigate } from "react-router-dom";
import { FaBrain, FaChevronRight } from "react-icons/fa";

/* ============================================================
   CAREGIVER AI ASSESSMENT

   Shows the latest AI assessment for each of the caregiver's
   assigned patients, using the `latestAssessment` field already
   returned by the existing getCaregiverPatients() endpoint
   (reused from caregiver.api.js — no new endpoint). Confidence
   is only shown because the API already provides it on
   `latestAssessment.confidence`; nothing here is invented.

   NOTE: There is no "assessment type" field anywhere in the
   assessment data this app exposes — every assessment in this
   system is a brain-scan-based AI analysis (see the existing
   AIAssessment upload form on the Doctor Dashboard), so that
   label is shown as a fixed description rather than a per-record
   API value.
============================================================ */

const predictionBadgeClass = (prediction) => {
  if (prediction === "Non Demented") return "cg-badge--green";
  if (prediction === "Moderate Dementia") return "cg-badge--red";
  if (prediction === "Mild Dementia") return "cg-badge--orange";
  return "cg-badge--orange";
};

const statusLabel = (prediction) => {
  if (prediction === "Non Demented") return "Stable";
  if (prediction === "Moderate Dementia") return "Attention Required";
  if (prediction === "Mild Dementia") return "Monitoring";
  return "Monitoring";
};

const AIAssessment = ({ patients = [], isLoading = false, onViewHistory }) => {
  const navigate = useNavigate();

  return (
    <div className="cg-card">
      <div className="cg-card__header">
        <div>
          <span>AI ASSESSMENT</span>
          <h2>Patient AI Assessments</h2>
        </div>
        <FaBrain />
      </div>

      {isLoading ? (
        <div className="cg-state">Loading assessments...</div>
      ) : patients.length === 0 ? (
        <div className="cg-state">
          <FaBrain />
          <strong>No patients assigned</strong>
          <span>AI assessment information will appear here once a patient is assigned to you.</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {patients.map((patient) => (
            <div
              key={patient._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid #eef1f6",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 180 }}>
                <strong style={{ fontSize: 14, display: "block" }}>
                  {patient.fullName}
                </strong>

                {patient.latestAssessment ? (
                  <span style={{ fontSize: 12, color: "#8b96ab" }}>
                    Brain Scan Analysis ·{" "}
                    {new Date(
                      patient.latestAssessment.createdAt
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: "#8b96ab" }}>
                    No assessment recorded yet
                  </span>
                )}
              </div>

              {patient.latestAssessment ? (
                <>
                  <span
                    className={`cg-badge ${predictionBadgeClass(
                      patient.latestAssessment.prediction
                    )}`}
                  >
                    {patient.latestAssessment.prediction}
                  </span>

                  <span className="cg-badge cg-badge--blue">
                    {statusLabel(patient.latestAssessment.prediction)}
                  </span>

                  {typeof patient.latestAssessment.confidence === "number" && (
                    <span className="cg-badge cg-badge--gray">
                      {patient.latestAssessment.confidence.toFixed(1)}% confidence
                    </span>
                  )}
                </>
              ) : (
                <span className="cg-badge cg-badge--gray">No data yet</span>
              )}

              <button
                type="button"
                className="cg-btn cg-btn--outline cg-btn--sm"
                onClick={() => navigate(`/caregiver/patients/${patient._id}`)}
              >
                View Details
                <FaChevronRight />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAssessment;
