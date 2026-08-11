import {
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

const appointments = [
  {
    id: 1,
    patient: "Lakshmi Devi",
    type: "Follow-up Consultation",
    time: "10:30 AM",
    date: "Today",
  },
  {
    id: 2,
    patient: "Ramesh Kumar",
    type: "Assessment Review",
    time: "12:00 PM",
    date: "Today",
  },
  {
    id: 3,
    patient: "Meena Rao",
    type: "Routine Check-up",
    time: "03:30 PM",
    date: "Today",
  },
];

const AppointmentCard = () => {
  return (
    <section className="doctor-dashboard__card">

      <div className="doctor-card-header">

        <div>
          <span>
            SCHEDULE
          </span>

          <h2>
            Upcoming Appointments
          </h2>
        </div>

        <FaCalendarAlt className="doctor-card-header__icon" />

      </div>

      <div className="doctor-appointments">

        {appointments.map(
          (appointment) => (
            <div
              className="doctor-appointment"
              key={appointment.id}
            >

              <div className="doctor-appointment__date">
                <strong>
                  {appointment.date ===
                  "Today"
                    ? "11"
                    : "12"}
                </strong>

                <span>
                  AUG
                </span>
              </div>

              <div className="doctor-appointment__info">

                <strong>
                  {appointment.patient}
                </strong>

                <span>
                  {appointment.type}
                </span>

                <small>
                  <FaClock />
                  {appointment.time}
                </small>

              </div>

              <button
                type="button"
                className="doctor-appointment__button"
              >
                View
              </button>

            </div>
          )
        )}

      </div>

    </section>
  );
};

export default AppointmentCard;