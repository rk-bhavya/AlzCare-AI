import { useNavigate } from "react-router-dom";
import { FaBrain, FaArrowRight } from "react-icons/fa";

import "./ListCard.css";

/* ============================================================
   RECENT ASSESSMENTS

   Shows the most recent AI assessments from the real
   getDoctorAssessments() list (already used by the existing
   AI Reports page) — sorted by createdAt, newest first.
============================================================ */

const predictionBadgeClass = (prediction) => {
  if (prediction === "Non Demented") return "list-card__badge--green";
  if (prediction === "Moderate Dementia") return "list-card__badge--red";
  if (prediction === "Mild Dementia") return "list-card__badge--orange";
  return "list-card__badge--blue";
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const RecentAssessments = ({ assessments = [], isLoading = false }) => {
  const navigate = useNavigate();

  const recent = [...assessments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="list-card">
      <div className="list-card__header">
        <div>
          <span>AI ASSESSMENTS</span>
          <h2>Recent Assessments</h2>
        </div>
        <button
          type="button"
          className="list-card__link"
          onClick={() => navigate("/doctor/ai-reports")}
        >
          View All <FaArrowRight />
        </button>
      </div>

      {isLoading ? (
        <div className="list-card__state">Loading assessments...</div>
      ) : recent.length === 0 ? (
        <div className="list-card__state">
          No assessments completed yet.
        </div>
      ) : (
        <div className="list-card__items">
          {recent.map((assessment) => (
            <div className="list-card__item" key={assessment._id}>
              <div className="list-card__avatar">
                <FaBrain />
              </div>

              <div className="list-card__item-body">
                <strong>
                  {assessment.patientId?.fullName || "Unknown Patient"}
                </strong>
                <span>{formatDate(assessment.createdAt)}</span>
              </div>

              <span
                className={`list-card__badge ${predictionBadgeClass(
                  assessment.prediction
                )}`}
              >
                {assessment.prediction || "Unknown"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentAssessments;
