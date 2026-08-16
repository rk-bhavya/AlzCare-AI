import { useEffect, useState } from "react";

import {
  FaCalendarAlt,
  FaClock,
  FaUserInjured,
  FaSearch,
  FaPlus,
  FaTimes,
  FaNotesMedical,
  FaUserMd,
} from "react-icons/fa";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";

import {
  createAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../../api/appointment.api.js";

import axiosInstance from "../../api/axiosinstance.js";

import "./DoctorAppointments.css";


const DoctorAppointments = () => {

  const [appointments, setAppointments] =
    useState([]);

  const [patients, setPatients] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filter, setFilter] =
    useState("All");


  /* ============================================================
     CREATE MODAL
  ============================================================ */

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [isCreating, setIsCreating] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [formData, setFormData] =
    useState({
      patientId: "",
      appointmentDate: "",
      type: "Follow-up Consultation",
      notes: "",
    });


  /* ============================================================
     VIEW MODAL
  ============================================================ */

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);


  /* ============================================================
     LOAD APPOINTMENTS
  ============================================================ */

  const loadAppointments = async () => {

    try {

      setIsLoading(true);
      setError("");

      const response =
        await getDoctorAppointments();

      setAppointments(
        response.appointments || []
      );

    } catch (error) {

      console.error(
        "Unable to load appointments:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load appointments."
      );

    } finally {

      setIsLoading(false);

    }

  };


  /* ============================================================
     LOAD PATIENTS
  ============================================================ */

  const loadPatients = async () => {

    try {

      const response =
        await axiosInstance.get(
          "/doctor/patients"
        );

      setPatients(
        response.data?.patients || []
      );

    } catch (error) {

      console.error(
        "Unable to load patients:",
        error
      );

    }

  };


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadAppointments();
    loadPatients();

  }, []);


  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = (date) => {

    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  };


  /* ============================================================
     FORMAT TIME
  ============================================================ */

  const formatTime = (date) => {

    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  /* ============================================================
     FORM CHANGE
  ============================================================ */

  const handleFormChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  /* ============================================================
     CREATE MODAL
  ============================================================ */

  const openCreateModal = () => {

    setFormError("");

    setFormData({
      patientId: "",
      appointmentDate: "",
      type: "Follow-up Consultation",
      notes: "",
    });

    setShowCreateModal(true);

  };


  const closeCreateModal = () => {

    if (isCreating) {
      return;
    }

    setShowCreateModal(false);
    setFormError("");

  };


  /* ============================================================
     CREATE APPOINTMENT
  ============================================================ */

  const handleCreateAppointment =
    async (event) => {

      event.preventDefault();

      setFormError("");


      if (!formData.patientId) {

        setFormError(
          "Please select a patient."
        );

        return;
      }


      if (!formData.appointmentDate) {

        setFormError(
          "Please select an appointment date and time."
        );

        return;
      }


      if (!formData.type) {

        setFormError(
          "Please select an appointment type."
        );

        return;
      }


      try {

        setIsCreating(true);


        await createAppointment({
          patientId:
            formData.patientId,

          appointmentDate:
            formData.appointmentDate,

          type:
            formData.type,

          notes:
            formData.notes,
        });


        setShowCreateModal(false);


        setFormData({
          patientId: "",
          appointmentDate: "",
          type: "Follow-up Consultation",
          notes: "",
        });


        await loadAppointments();

      } catch (error) {

        console.error(
          "Unable to create appointment:",
          error
        );

        setFormError(
          error.response?.data?.message ||
            "Unable to create appointment."
        );

      } finally {

        setIsCreating(false);

      }

    };


  /* ============================================================
     UPDATE STATUS
  ============================================================ */

  const handleStatusChange =
    async (
      appointmentId,
      status
    ) => {

      try {

        await updateAppointmentStatus(
          appointmentId,
          status
        );

        await loadAppointments();

        /*
         * Also update the currently open
         * appointment modal.
         */

        setSelectedAppointment(
          (previous) => {

            if (
              !previous ||
              previous._id !== appointmentId
            ) {
              return previous;
            }

            return {
              ...previous,
              status,
            };

          }
        );

      } catch (error) {

        console.error(
          "Unable to update appointment:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to update appointment."
        );

      }

    };


  /* ============================================================
     FILTER
  ============================================================ */

  const filteredAppointments =
    appointments.filter(
      (appointment) => {

        const patientName =
          appointment.patientId
            ?.fullName
            ?.toLowerCase() || "";

        const search =
          searchTerm
            .toLowerCase()
            .trim();

        const matchesSearch =
          !search ||
          patientName.includes(search);


        const status =
          appointment.status ||
          "scheduled";


        const displayStatus =
          status.charAt(0).toUpperCase() +
          status.slice(1);


        const matchesFilter =
          filter === "All" ||
          displayStatus === filter;


        return (
          matchesSearch &&
          matchesFilter
        );

      }
    );


  /* ============================================================
     MINIMUM DATE
  ============================================================ */

  const getMinimumDateTime = () => {

    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        now.getDate()
      ).padStart(2, "0");

    const hours =
      String(
        now.getHours()
      ).padStart(2, "0");

    const minutes =
      String(
        now.getMinutes()
      ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;

  };


  return (

    <div className="doctor-dashboard">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <DoctorSidebar
        activePage="Appointments"
      />


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="doctor-dashboard__main">

        <DoctorHeader />


        <div className="doctor-dashboard__content doctor-appointments">


          {/* ==================================================
              HEADER
          ================================================== */}

          <section className="doctor-appointments__header">

            <div>

              <span>
                SCHEDULE
              </span>

              <h1>
                Appointments
              </h1>

              <p>
                Manage your upcoming and previous
                patient appointments.
              </p>

            </div>


            <button
              type="button"
              className="doctor-appointments__add"
              onClick={openCreateModal}
            >

              <FaPlus />

              New Appointment

            </button>

          </section>


          {/* ==================================================
              APPOINTMENTS CARD
          ================================================== */}

          <section className="doctor-dashboard__card doctor-appointments__card">


            <div className="doctor-appointments__toolbar">

              <div className="doctor-appointments__search">

                <FaSearch />

                <input
                  type="text"
                  placeholder="Search patient..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

              </div>


              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value
                  )
                }
                className="doctor-appointments__filter"
              >

                <option value="All">
                  All Appointments
                </option>

                <option value="Scheduled">
                  Scheduled
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>

                <option value="Rescheduled">
                  Rescheduled
                </option>

              </select>

            </div>


            {/* ERROR */}

            {!isLoading && error && (

              <div className="doctor-appointments__error">

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

            )}


            {/* LOADING */}

            {isLoading && (

              <div className="doctor-appointments__empty">

                <FaCalendarAlt />

                <strong>
                  Loading appointments...
                </strong>

              </div>

            )}


            {/* EMPTY */}

            {!isLoading &&
              !error &&
              filteredAppointments.length === 0 && (

                <div className="doctor-appointments__empty">

                  <FaCalendarAlt />

                  <strong>
                    No appointments found
                  </strong>

                  <span>
                    Your scheduled patient
                    appointments will appear here.
                  </span>

                </div>

              )}


            {/* APPOINTMENTS */}

            {!isLoading &&
              !error &&
              filteredAppointments.length > 0 && (

                <div className="doctor-appointments__list">

                  {filteredAppointments.map(
                    (appointment) => {

                      const patient =
                        appointment.patientId;

                      const status =
                        appointment.status ||
                        "scheduled";

                      return (

                        <div
                          className="doctor-appointment-row"
                          key={
                            appointment._id
                          }
                        >


                          {/* DATE */}

                          <div className="doctor-appointment-row__date">

                            <FaCalendarAlt />

                            <div>

                              <strong>
                                {formatDate(
                                  appointment.appointmentDate
                                )}
                              </strong>

                              <span>
                                {formatTime(
                                  appointment.appointmentDate
                                )}
                              </span>

                            </div>

                          </div>


                          {/* PATIENT */}

                          <div className="doctor-appointment-row__patient">

                            <div className="doctor-appointment-row__avatar">

                              {patient?.fullName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "P"}

                            </div>

                            <div>

                              <strong>
                                {patient?.fullName ||
                                  "Unknown Patient"}
                              </strong>

                              <span>
                                <FaUserInjured />
                                Patient
                              </span>

                            </div>

                          </div>


                          {/* TYPE */}

                          <div className="doctor-appointment-row__type">

                            <strong>
                              {appointment.type ||
                                "Consultation"}
                            </strong>

                            <span>
                              Appointment
                            </span>

                          </div>


                          {/* TIME */}

                          <div className="doctor-appointment-row__time">

                            <FaClock />

                            <span>
                              {formatTime(
                                appointment.appointmentDate
                              )}
                            </span>

                          </div>


                          {/* STATUS */}

                          <select
                            value={status}
                            onChange={(event) =>
                              handleStatusChange(
                                appointment._id,
                                event.target.value
                              )
                            }
                            className={`doctor-appointment-status doctor-appointment-status--${status}`}
                          >

                            <option value="scheduled">
                              Scheduled
                            </option>

                            <option value="completed">
                              Completed
                            </option>

                            <option value="cancelled">
                              Cancelled
                            </option>

                            <option value="rescheduled">
                              Rescheduled
                            </option>

                          </select>


                          {/* VIEW */}

                          <button
                            type="button"
                            className="doctor-appointment-row__view"
                            onClick={() =>
                              setSelectedAppointment(
                                appointment
                              )
                            }
                          >

                            View

                          </button>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

          </section>

        </div>

      </main>


      {/* ======================================================
          CREATE APPOINTMENT MODAL
      ====================================================== */}

      {showCreateModal && (

        <div
          className="doctor-appointment-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeCreateModal();
            }

          }}
        >

          <div className="doctor-appointment-modal">

            <div className="doctor-appointment-modal__header">

              <div>

                <span>
                  SCHEDULE
                </span>

                <h2>
                  New Appointment
                </h2>

                <p>
                  Schedule an appointment
                  for a patient.
                </p>

              </div>


              <button
                type="button"
                className="doctor-appointment-modal__close"
                onClick={
                  closeCreateModal
                }
                disabled={isCreating}
              >

                <FaTimes />

              </button>

            </div>


            <form
              onSubmit={
                handleCreateAppointment
              }
            >

              <div className="doctor-appointment-form__group">

                <label>
                  Patient
                </label>

                <select
                  name="patientId"
                  value={
                    formData.patientId
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                >

                  <option value="">
                    Select patient
                  </option>

                  {patients.map(
                    (patient) => (

                      <option
                        key={
                          patient._id
                        }
                        value={
                          patient._id
                        }
                      >
                        {patient.fullName}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="doctor-appointment-form__group">

                <label>
                  Date & Time
                </label>

                <input
                  type="datetime-local"
                  name="appointmentDate"
                  value={
                    formData.appointmentDate
                  }
                  min={
                    getMinimumDateTime()
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                />

              </div>


              <div className="doctor-appointment-form__group">

                <label>
                  Appointment Type
                </label>

                <select
                  name="type"
                  value={
                    formData.type
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                >

                  <option value="Follow-up Consultation">
                    Follow-up Consultation
                  </option>

                  <option value="Initial Consultation">
                    Initial Consultation
                  </option>

                  <option value="Assessment Review">
                    Assessment Review
                  </option>

                  <option value="Routine Check-up">
                    Routine Check-up
                  </option>

                  <option value="Medication Review">
                    Medication Review
                  </option>

                </select>

              </div>


              <div className="doctor-appointment-form__group">

                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={
                    formData.notes
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Optional appointment notes..."
                  rows="4"
                />

              </div>


              {formError && (

                <div className="doctor-appointment-form__error">
                  {formError}
                </div>

              )}


              <div className="doctor-appointment-modal__actions">

                <button
                  type="button"
                  className="doctor-appointment-modal__cancel"
                  onClick={
                    closeCreateModal
                  }
                  disabled={isCreating}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="doctor-appointment-modal__submit"
                  disabled={isCreating}
                >

                  {isCreating
                    ? "Creating..."
                    : "Create Appointment"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          VIEW APPOINTMENT MODAL
      ====================================================== */}

      {selectedAppointment && (

        <div
          className="doctor-appointment-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedAppointment(
                null
              );
            }

          }}
        >

          <div className="doctor-appointment-view-modal">


            {/* HEADER */}

            <div className="doctor-appointment-modal__header">

              <div>

                <span>
                  APPOINTMENT DETAILS
                </span>

                <h2>
                  Appointment Information
                </h2>

                <p>
                  Review the scheduled
                  appointment details.
                </p>

              </div>


              <button
                type="button"
                className="doctor-appointment-modal__close"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
              >

                <FaTimes />

              </button>

            </div>


            {/* PATIENT */}

            <div className="doctor-appointment-view__patient">

              <div className="doctor-appointment-view__avatar">

                {selectedAppointment
                  .patientId
                  ?.fullName
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "P"}

              </div>

              <div>

                <strong>
                  {
                    selectedAppointment
                      .patientId
                      ?.fullName ||
                    "Unknown Patient"
                  }
                </strong>

                <span>
                  Patient
                </span>

              </div>

            </div>


            {/* DETAILS */}

            <div className="doctor-appointment-view__details">


              <div className="doctor-appointment-view__detail">

                <FaCalendarAlt />

                <div>

                  <span>
                    Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedAppointment
                        .appointmentDate
                    )}
                  </strong>

                </div>

              </div>


              <div className="doctor-appointment-view__detail">

                <FaClock />

                <div>

                  <span>
                    Time
                  </span>

                  <strong>
                    {formatTime(
                      selectedAppointment
                        .appointmentDate
                    )}
                  </strong>

                </div>

              </div>


              <div className="doctor-appointment-view__detail">

                <FaCalendarAlt />

                <div>

                  <span>
                    Appointment Type
                  </span>

                  <strong>
                    {
                      selectedAppointment.type ||
                      "Consultation"
                    }
                  </strong>

                </div>

              </div>


              <div className="doctor-appointment-view__detail">

                <FaUserMd />

                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {
                      (
                        selectedAppointment.status ||
                        "scheduled"
                      )
                        .charAt(0)
                        .toUpperCase() +
                      (
                        selectedAppointment.status ||
                        "scheduled"
                      ).slice(1)
                    }
                  </strong>

                </div>

              </div>

            </div>


            {/* NOTES */}

            <div className="doctor-appointment-view__notes">

              <div>

                <FaNotesMedical />

                <strong>
                  Appointment Notes
                </strong>

              </div>

              <p>
                {
                  selectedAppointment.notes ||
                  "No notes were added for this appointment."
                }
              </p>

            </div>


            {/* ACTIONS */}

            <div className="doctor-appointment-view__actions">

              <button
                type="button"
                className="doctor-appointment-modal__cancel"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};


export default DoctorAppointments;