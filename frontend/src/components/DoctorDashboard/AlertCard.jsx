import {
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

const alerts = [
  {
    id: 1,
    patient: "Ramesh Kumar",
    message:
      "Missed medication reported by caregiver.",
    severity: "Warning",
    time: "15 min ago",
  },
  {
    id: 2,
    patient: "Lakshmi Devi",
    message:
      "New AI assessment is available for review.",
    severity: "Information",
    time: "1 hour ago",
  },
  {
    id: 3,
    patient: "Meena Rao",
    message:
      "Patient left the configured safe zone.",
    severity: "Critical",
    time: "2 hours ago",
  },
];

const AlertCard = () => {
  return (
    <section className="doctor-dashboard__card">

      <div className="doctor-card-header">

        <div>
          <span>
            PATIENT SAFETY
          </span>

          <h2>
            Recent Alerts
          </h2>
        </div>

      </div>

      <div className="doctor-alerts">

        {alerts.map((alert) => {

          const isCritical =
            alert.severity ===
            "Critical";

          const isWarning =
            alert.severity ===
            "Warning";

          return (
            <div
              className={`doctor-alert ${
                isCritical
                  ? "doctor-alert--critical"
                  : isWarning
                  ? "doctor-alert--warning"
                  : "doctor-alert--info"
              }`}
              key={alert.id}
            >

              <div className="doctor-alert__icon">

                {isCritical ||
                isWarning ? (
                  <FaExclamationTriangle />
                ) : (
                  <FaInfoCircle />
                )}

              </div>

              <div className="doctor-alert__content">

                <div>
                  <strong>
                    {alert.patient}
                  </strong>

                  <span>
                    {alert.severity}
                  </span>
                </div>

                <p>
                  {alert.message}
                </p>

                <small>
                  {alert.time}
                </small>

              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
};

export default AlertCard;