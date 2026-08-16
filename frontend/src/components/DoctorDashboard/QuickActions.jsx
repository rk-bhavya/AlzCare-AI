import {
  FaUserInjured,
  FaBrain,
  FaCalendarCheck,
  FaBell,
  FaComments,
  FaNotesMedical,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";


const QuickActions = () => {

  const navigate = useNavigate();


  const actions = [
    {
      label: "View Patients",
      icon: <FaUserInjured />,
      path: "/doctor/patients",
    },

    {
      label: "Review AI Reports",
      icon: <FaBrain />,
      path: "/doctor/ai-reports",
    },

    {
      label: "Today's Appointments",
      icon: <FaCalendarCheck />,
      path: "/doctor/appointments",
    },

    {
      label: "Patient Alerts",
      icon: <FaBell />,
      path: "/doctor/notifications",
    },

    {
      label: "Message Caregiver",
      icon: <FaComments />,
      path: "/doctor/messages",
    },

    {
      label: "Add Clinical Note",
      icon: <FaNotesMedical />,
      path: "/doctor/patients",
    },
  ];


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

        {actions.map(
          (action) => (

            <button
              type="button"
              className="doctor-quick-action"
              key={action.label}
              onClick={() =>
                navigate(
                  action.path
                )
              }
            >

              <span>
                {action.icon}
              </span>

              <strong>
                {action.label}
              </strong>

            </button>

          )
        )}

      </div>

    </section>
  );
};


export default QuickActions;