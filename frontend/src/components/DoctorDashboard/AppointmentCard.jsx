import { useEffect, useState } from "react";

import {
  FaCalendarAlt,
  FaClock,
  FaSpinner,
  FaEye,
} from "react-icons/fa";

import {
  getTodaysAppointments,
} from "../../api/appointment.api.js";


const AppointmentCard = () => {

  const [appointments, setAppointments] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ============================================================
     LOAD TODAY'S APPOINTMENTS
  ============================================================ */

  const loadAppointments = async () => {

    try {

      setIsLoading(true);
      setError("");

      const response =
        await getTodaysAppointments();

      setAppointments(
        response.appointments || []
      );

    } catch (error) {

      console.error(
        "Unable to load today's appointments:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load today's appointments."
      );

    } finally {

      setIsLoading(false);

    }
  };


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadAppointments();

  }, []);


  /* ============================================================
     FORMAT TIME
  ============================================================ */

  const formatTime = (date) => {

    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

  };


  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {

    return (
      <section className="doctor-dashboard__card">

        <div className="doctor-card-header">

          <div>

            <span>
              SCHEDULE
            </span>

            <h2>
              Today's Appointments
            </h2>

          </div>

          <FaCalendarAlt
            className="doctor-card-header__icon"
          />

        </div>


        <div className="doctor-appointments__state">

          <FaSpinner
            className="appointment-spinner"
          />

          <span>
            Loading appointments...
          </span>

        </div>

      </section>
    );
  }


  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {

    return (
      <section className="doctor-dashboard__card">

        <div className="doctor-card-header">

          <div>

            <span>
              SCHEDULE
            </span>

            <h2>
              Today's Appointments
            </h2>

          </div>

          <FaCalendarAlt
            className="doctor-card-header__icon"
          />

        </div>


        <div className="doctor-appointments__state doctor-appointments__state--error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={loadAppointments}
          >
            Try Again
          </button>

        </div>

      </section>
    );
  }


  /* ============================================================
     EMPTY
  ============================================================ */

  if (appointments.length === 0) {

    return (
      <section className="doctor-dashboard__card">

        <div className="doctor-card-header">

          <div>

            <span>
              SCHEDULE
            </span>

            <h2>
              Today's Appointments
            </h2>

          </div>

          <FaCalendarAlt
            className="doctor-card-header__icon"
          />

        </div>


        <div className="doctor-appointments__state">

          <FaCalendarAlt />

          <strong>
            No appointments today
          </strong>

          <span><div></div>
            Today's scheduled appointments
            will appear here.
          </span>

        </div>

      </section>
    );
  }


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section className="doctor-dashboard__card">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="doctor-card-header">

        <div>

          <span>
            SCHEDULE
          </span>

          <h2>
            Today's Appointments
          </h2>

        </div>

        <FaCalendarAlt
          className="doctor-card-header__icon"
        />

      </div>


      {/* ======================================================
          APPOINTMENTS
      ====================================================== */}

      <div className="doctor-appointments">

        {appointments
          .slice(0, 4)
          .map((appointment) => {

            const patientName =
              appointment.patientId
                ?.fullName ||
              "Unknown Patient";


            return (
              <div
                className="doctor-appointment"
                key={appointment._id}
              >

                {/* DATE */}

                <div className="doctor-appointment__date">

                  <strong>
                    {new Date(
                      appointment.appointmentDate
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                      }
                    )}
                  </strong>

                  <span>
                    {new Date(
                      appointment.appointmentDate
                    )
                      .toLocaleDateString(
                        "en-IN",
                        {
                          month: "short",
                        }
                      )
                      .toUpperCase()}
                  </span>

                </div>


                {/* INFORMATION */}

                <div className="doctor-appointment__info">

                  <strong>
                    {patientName}
                  </strong>

                  <span>
                    {appointment.type ||
                      "Consultation"}
                  </span>

                  <small>

                    <FaClock />

                    {formatTime(
                      appointment.appointmentDate
                    )}

                  </small>

                </div>


                {/* VIEW */}

                <button
                  type="button"
                  className="doctor-appointment__button"
                  onClick={() => {
                    alert(
                      `Appointment with ${patientName}\n\n${appointment.type}\n${formatTime(
                        appointment.appointmentDate
                      )}`
                    );
                  }}
                >

                  <FaEye />

                  View

                </button>

              </div>
            );

          })}

      </div>


      {/* ======================================================
          MORE APPOINTMENTS
      ====================================================== */}

      {appointments.length > 4 && (

        <div className="doctor-appointments__more">

          +{appointments.length - 4}
          {" "}more appointments today

        </div>

      )}

    </section>
  );
};


export default AppointmentCard;