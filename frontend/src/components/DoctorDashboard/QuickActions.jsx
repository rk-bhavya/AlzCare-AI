import {
  FaUserInjured,
  FaBrain,
  FaCalendarCheck,
  FaBell,
  FaComments,
  FaNotesMedical,
} from "react-icons/fa";

const actions = [
  {
    label: "View Patients",
    icon: <FaUserInjured />,
  },
  {
    label: "Review AI Reports",
    icon: <FaBrain />,
  },
  {
    label: "Today's Appointments",
    icon: <FaCalendarCheck />,
  },
  {
    label: "Patient Alerts",
    icon: <FaBell />,
  },
  {
    label: "Message Caregiver",
    icon: <FaComments />,
  },
  {
    label: "Add Clinical Note",
    icon: <FaNotesMedical />,
  },
];

const QuickActions = () => {
  return (
    <section className="doctor-dashboard__card">

      <div className="doctor-card-header">

        <div>
          <span>
            SHORTCUTS
          </span>

          <h2>
            Quick Actions
          </h2>
        </div>

      </div>

      <div className="doctor-quick-actions">

        {actions.map((action) => (
          <button
            type="button"
            className="doctor-quick-action"
            key={action.label}
          >
            <span>
              {action.icon}
            </span>

            <strong>
              {action.label}
            </strong>
          </button>
        ))}

      </div>

    </section>
  );
};

export default QuickActions;