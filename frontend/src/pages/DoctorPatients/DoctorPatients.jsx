import { useEffect, useState } from "react";

import {
  FaSearch,
  FaSyncAlt,
  FaUserInjured,
  FaUserPlus,
  FaEye,
  FaTimes,
  FaNotesMedical,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axiosinstance.js";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";

import "./DoctorPatients.css";


const DoctorPatients = () => {

  const navigate = useNavigate();


  /* ============================================================
     PATIENT DATA
  ============================================================ */

  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");


  /* ============================================================
     ASSIGNMENT MODAL
  ============================================================ */

  const [selectedPatient, setSelectedPatient] =
    useState(null);

  const [selectedCaregiver, setSelectedCaregiver] =
    useState("");

  const [isAssigning, setIsAssigning] =
    useState(false);

  const [assignmentMessage, setAssignmentMessage] =
    useState("");


  /* ============================================================
     LOAD PATIENTS
  ============================================================ */

  const loadPatients = async () => {

    try {

      setIsLoading(true);
      setError("");

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

      setError(
        error.response?.data?.message ||
          "Unable to load patients."
      );

    } finally {

      setIsLoading(false);

    }
  };


  /* ============================================================
     LOAD CAREGIVERS
  ============================================================ */

  const loadCaregivers = async () => {

    try {

      const response =
        await axiosInstance.get(
          "/doctor/caregivers"
        );

      setCaregivers(
        response.data?.caregivers || []
      );

    } catch (error) {

      console.error(
        "Unable to load caregivers:",
        error
      );

    }
  };


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadPatients();
    loadCaregivers();

  }, []);


  /* ============================================================
     SEARCH
  ============================================================ */

  const filteredPatients =
    patients.filter((patient) => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      if (!search) {
        return true;
      }

      return (
        patient.fullName
          ?.toLowerCase()
          .includes(search) ||

        patient.email
          ?.toLowerCase()
          .includes(search) ||

        patient.caregiver?.fullName
          ?.toLowerCase()
          .includes(search)
      );

    });


  /* ============================================================
     OPEN ASSIGNMENT MODAL
  ============================================================ */

  const openAssignmentModal = (patient) => {

    setSelectedPatient(patient);

    setSelectedCaregiver(
      patient.caregiver?._id || ""
    );

    setAssignmentMessage("");

  };


  /* ============================================================
     CLOSE ASSIGNMENT MODAL
  ============================================================ */

  const closeAssignmentModal = () => {

    if (isAssigning) {
      return;
    }

    setSelectedPatient(null);

    setSelectedCaregiver("");

    setAssignmentMessage("");

  };


  /* ============================================================
     ASSIGN CAREGIVER
  ============================================================ */

  const handleAssignCaregiver = async () => {

    if (
      !selectedPatient ||
      !selectedCaregiver
    ) {

      setAssignmentMessage(
        "Please select a caregiver."
      );

      return;

    }

    try {

      setIsAssigning(true);
      setAssignmentMessage("");

      const response =
        await axiosInstance.post(
          "/doctor/assign-patient",
          {
            patientId:
              selectedPatient._id,

            caregiverId:
              selectedCaregiver,
          }
        );

      setAssignmentMessage(
        response.data?.message ||
          "Patient assigned successfully."
      );

      await loadPatients();

      setTimeout(() => {

        closeAssignmentModal();

      }, 800);

    } catch (error) {

      console.error(
        "Unable to assign caregiver:",
        error
      );

      setAssignmentMessage(
        error.response?.data?.message ||
          "Unable to assign caregiver."
      );

    } finally {

      setIsAssigning(false);

    }

  };


  /* ============================================================
     VIEW PATIENT
  ============================================================ */

  const handleViewPatient = (patient) => {

    navigate(
      `/doctor/patients/${patient._id}`
    );

  };


  /* ============================================================
     CLINICAL NOTES
  ============================================================ */

  const handleClinicalNotes = (patient) => {

    navigate(
      `/doctor/clinical-notes?patientId=${patient._id}`
    );

  };


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="doctor-dashboard">


      <DoctorSidebar
        activePage="My Patients"
      />


      <main className="doctor-dashboard__main">

        <DoctorHeader />


        <div className="doctor-dashboard__content">


          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section className="doctor-page-header">

            <div>

              <span>
                PATIENT MANAGEMENT
              </span>

              <h1>
                My Patients
              </h1>

              <p>
                View and manage patients assigned
                to your care.
              </p>

            </div>


            <button
              type="button"
              className="doctor-refresh-button"
              onClick={loadPatients}
              disabled={isLoading}
            >

              <FaSyncAlt />

              Refresh

            </button>

          </section>


          {/* ==================================================
              SEARCH + PATIENT LIST
          ================================================== */}

          <section className="doctor-dashboard__card doctor-patients-card">

            <div className="doctor-patients-toolbar">

              <div className="doctor-patients-count">

                <FaUserInjured />

                <strong>

                  {isLoading
                    ? "Loading..."
                    : `${filteredPatients.length} ${
                        filteredPatients.length === 1
                          ? "Patient"
                          : "Patients"
                      }`}

                </strong>

              </div>


              <div className="doctor-patient-search">

                <FaSearch />

                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="doctor-patients-error">

                {error}

                <button
                  type="button"
                  onClick={loadPatients}
                >
                  Try Again
                </button>

              </div>

            )}


            {/* LOADING */}

            {isLoading && (

              <div className="doctor-patients-empty">

                Loading patients...

              </div>

            )}


            {/* EMPTY */}

            {!isLoading &&
              !error &&
              filteredPatients.length === 0 && (

                <div className="doctor-patients-empty">

                  <FaUserInjured />

                  <strong>
                    No patients found
                  </strong>

                  <span>

                    {searchTerm
                      ? "Try a different search term."
                      : "There are currently no registered patients."}

                  </span>

                </div>

              )}


            {/* PATIENT TABLE */}

            {!isLoading &&
              filteredPatients.length > 0 && (

                <div className="doctor-patients-table-wrapper">

                  <table className="doctor-patients-page-table">

                    <thead>

                      <tr>

                        <th>Patient</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Contact</th>
                        <th>Caregiver</th>
                        <th>Status</th>
                        <th>Actions</th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredPatients.map(
                        (patient) => (

                          <tr
                            key={
                              patient._id
                            }
                          >

                            {/* PATIENT */}

                            <td>

                              <div className="doctor-page-patient">

                                {patient.profilePicture?.url ? (

                                  <img
                                    src={
                                      patient.profilePicture.url
                                    }
                                    alt={
                                      patient.fullName
                                    }
                                  />

                                ) : (

                                  <div className="doctor-page-patient-avatar">

                                    {patient.fullName
                                      ?.charAt(0)
                                      .toUpperCase()}

                                  </div>

                                )}

                                <div>

                                  <strong>
                                    {patient.fullName}
                                  </strong>

                                  <span>
                                    Patient
                                  </span>

                                </div>

                              </div>

                            </td>


                            {/* AGE */}

                            <td>
                              {patient.age || "—"}
                            </td>


                            {/* GENDER */}

                            <td>
                              {patient.gender || "—"}
                            </td>


                            {/* CONTACT */}

                            <td>

                              <div className="doctor-patient-contact">

                                <span>
                                  {patient.email || "—"}
                                </span>

                                <small>
                                  {
                                    patient.phone ||
                                    "No phone"
                                  }
                                </small>

                              </div>

                            </td>


                            {/* CAREGIVER */}

                            <td>

                              {patient.caregiver ? (

                                <div className="doctor-caregiver-name">

                                  <FaUserInjured />

                                  <span>
                                    {
                                      patient
                                        .caregiver
                                        .fullName
                                    }
                                  </span>

                                </div>

                              ) : (

                                <span className="doctor-unassigned">
                                  Not assigned
                                </span>

                              )}

                            </td>


                            {/* STATUS */}

                            <td>

                              <span
                                className={`doctor-page-status ${
                                  patient.assignment
                                    ?.status ===
                                  "active"
                                    ? "doctor-page-status--active"
                                    : "doctor-page-status--pending"
                                }`}
                              >

                                {
                                  patient.assignment
                                    ?.status ||
                                  "Unassigned"
                                }

                              </span>

                            </td>


                            {/* ACTIONS */}

                            <td>

                              <div className="doctor-page-actions">


                                {/* VIEW */}

                                <button
                                  type="button"
                                  className="doctor-page-view-button"
                                  onClick={() =>
                                    handleViewPatient(
                                      patient
                                    )
                                  }
                                >

                                  <FaEye />

                                  View

                                </button>


                                {/* NOTES */}

                                <button
                                  type="button"
                                  className="doctor-page-view-button"
                                  onClick={() =>
                                    handleClinicalNotes(
                                      patient
                                    )
                                  }
                                >

                                  <FaNotesMedical />

                                  Notes

                                </button>


                                {/* ASSIGN / CHANGE */}

                                <button
                                  type="button"
                                  className="doctor-page-assign-button"
                                  onClick={() =>
                                    openAssignmentModal(
                                      patient
                                    )
                                  }
                                >

                                  <FaUserPlus />

                                  {patient.caregiver
                                    ? "Change"
                                    : "Assign"}

                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

          </section>

        </div>

      </main>


      {/* ======================================================
          ASSIGN CAREGIVER MODAL
      ====================================================== */}

      {selectedPatient && (

        <div
          className="doctor-assignment-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeAssignmentModal();

            }

          }}
        >

          <div className="doctor-assignment-modal">


            <div className="doctor-assignment-modal__header">

              <div>

                <span>
                  CAREGIVER MANAGEMENT
                </span>

                <h2>

                  {selectedPatient.caregiver
                    ? "Change Caregiver"
                    : "Assign Caregiver"}

                </h2>

                <p>

                  Patient:{" "}

                  <strong>
                    {selectedPatient.fullName}
                  </strong>

                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeAssignmentModal
                }
                disabled={isAssigning}
                className="doctor-assignment-close"
              >

                <FaTimes />

              </button>

            </div>


            <div className="doctor-assignment-field">

              <label>
                Select Caregiver
              </label>

              <select
                value={
                  selectedCaregiver
                }
                onChange={(event) =>
                  setSelectedCaregiver(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select a caregiver
                </option>

                {caregivers.map(
                  (caregiver) => (

                    <option
                      key={
                        caregiver._id
                      }
                      value={
                        caregiver._id
                      }
                    >

                      {caregiver.fullName}

                    </option>

                  )
                )}

              </select>

            </div>


            {assignmentMessage && (

              <div className="doctor-assignment-message">

                {assignmentMessage}

              </div>

            )}


            <div className="doctor-assignment-modal__actions">

              <button
                type="button"
                className="doctor-assignment-cancel"
                onClick={
                  closeAssignmentModal
                }
                disabled={isAssigning}
              >
                Cancel
              </button>


              <button
                type="button"
                className="doctor-assignment-submit"
                onClick={
                  handleAssignCaregiver
                }
                disabled={
                  isAssigning ||
                  !selectedCaregiver
                }
              >

                <FaUserPlus />

                {isAssigning
                  ? "Assigning..."
                  : "Save Assignment"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};


export default DoctorPatients;