import { useNavigate } from "react-router-dom";
import { FaUserInjured, FaArrowRight } from "react-icons/fa";

import "./ListCard.css";

/* ============================================================
   RECENT PATIENTS

   Shows the first few patients from the real `/doctor/patients`
   list already loaded by the dashboard (same array used by
   PatientOverview) — no separate request, no invented fields.
============================================================ */

const RecentPatients = ({ patients = [], isLoading = false }) => {
  const navigate = useNavigate();
  const recent = patients.slice(0, 5);

  return (
    <div className="list-card">
      <div className="list-card__header">
        <div>
          <span>PATIENTS</span>
          <h2>Recent Patients</h2>
        </div>
        <button
          type="button"
          className="list-card__link"
          onClick={() =>
            document
              .getElementById("doctor-patients")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          View All <FaArrowRight />
        </button>
      </div>

      {isLoading ? (
        <div className="list-card__state">Loading patients...</div>
      ) : recent.length === 0 ? (
        <div className="list-card__state">No patients assigned yet.</div>
      ) : (
        <div className="list-card__items">
          {recent.map((patient) => (
            <div className="list-card__item" key={patient._id}>
              <div className="list-card__avatar">
                {patient.profilePicture?.url ? (
                  <img src={patient.profilePicture.url} alt={patient.fullName} />
                ) : (
                  <FaUserInjured />
                )}
              </div>

              <div className="list-card__item-body">
                <strong>{patient.fullName}</strong>
                <span>
                  {patient.age ? `${patient.age} yrs` : "Age not on record"}
                  {patient.gender ? ` · ${patient.gender}` : ""}
                </span>
              </div>

              <span
                className={`list-card__badge ${
                  patient.assignment?.status === "active"
                    ? "list-card__badge--green"
                    : "list-card__badge--gray"
                }`}
              >
                {patient.assignment?.status === "active"
                  ? "Active"
                  : patient.assignment?.status || "Unassigned"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentPatients;
