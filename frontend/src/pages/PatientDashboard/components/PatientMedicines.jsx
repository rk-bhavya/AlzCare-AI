import { formatTime12h } from "../patientDashboardUtils.js";

/* ============================================================
   PATIENT MEDICINES

   Shows today's real medication schedule (from the existing
   GET /patient-devices/me/medications/today). Only medicine
   name, scheduled time and status are shown — the dose and
   instructions come straight from the API when present, never
   invented. "Missed" is shown as "Please take now" in friendly
   language rather than an alarming label.
============================================================ */

const PatientMedicines = ({ medications, busyKey, onMarkTaken }) => {
  const takenCount = medications.filter((m) => m.status === "taken").length;

  return (
    <div>
      <h1 className="patient-dash__title">💊 Today's Medicines</h1>

      {medications.length > 0 && (
        <p className="patient-dash__subtitle">
          {takenCount} of {medications.length} taken today
        </p>
      )}

      {medications.length === 0 ? (
        <div className="patient-card">
          <div className="patient-card__icon">✅</div>
          <h3>No medicines today</h3>
          <p>Nothing is scheduled for you today.</p>
        </div>
      ) : (
        medications.map((med) => {
          const key = `${med.medicationId}_${med.time}`;
          const isBusy = busyKey === key;
          const isTaken = med.status === "taken";
          const isOverdue = med.status === "missed";

          return (
            <div
              key={key}
              className={`patient-card patient-med-card ${
                isTaken ? "patient-med-card--taken" : ""
              } ${isOverdue ? "patient-med-card--overdue" : ""}`}
            >
              <div className="patient-med-card__top">
                <div>
                  <h3>{med.name}</h3>
                  {med.dosage && (
                    <p className="patient-med-card__dose">{med.dosage}</p>
                  )}
                  <p className="patient-med-card__time">
                    ⏰ {formatTime12h(med.time)}
                  </p>
                </div>

                <span
                  className={`patient-status-pill ${
                    isTaken
                      ? "patient-status-pill--done"
                      : isOverdue
                      ? "patient-status-pill--overdue"
                      : "patient-status-pill--pending"
                  }`}
                >
                  {isTaken ? "Taken ✓" : isOverdue ? "Take now" : "Not yet"}
                </span>
              </div>

              {med.instructions && (
                <p className="patient-med-card__instructions">
                  {med.instructions}
                </p>
              )}

              {!isTaken && (
                <button
                  type="button"
                  className="patient-btn patient-btn--primary patient-btn--block"
                  disabled={isBusy}
                  onClick={() => onMarkTaken(med.medicationId, med.time)}
                >
                  {isBusy ? "Saving..." : "✓ I Took This Medicine"}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default PatientMedicines;
