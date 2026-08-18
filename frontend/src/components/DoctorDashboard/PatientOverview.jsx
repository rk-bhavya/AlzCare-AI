import { useEffect, useMemo, useState } from "react";

import {
  FaArrowRight,
  FaSearch,
  FaTimes,
  FaUserPlus,
} from "react-icons/fa";

import axiosInstance from "../../api/axiosInstance.js";
const PatientOverview = ({
  patients = [],
  isLoading = false,
  error = "",
  onRefresh,
}) => {

  /* ============================================================
     CAREGIVERS
  ============================================================ */

  const [caregivers, setCaregivers] = useState([]);

  const [isLoadingCaregivers, setIsLoadingCaregivers] =
    useState(false);


  /* ============================================================
     FILTER
  ============================================================ */

  const [searchTerm, setSearchTerm] = useState("");


  /* ============================================================
     ASSIGNMENT MODAL
  ============================================================ */

  const [showAssignmentModal, setShowAssignmentModal] =
    useState(false);

  const [selectedPatient, setSelectedPatient] =
    useState(null);

  const [selectedCaregiver, setSelectedCaregiver] =
    useState("");


  const [isAssigning, setIsAssigning] =
    useState(false);

  const [assignmentError, setAssignmentError] =
    useState("");

  const [assignmentSuccess, setAssignmentSuccess] =
    useState("");


  /* ============================================================
     LOAD CAREGIVERS
  ============================================================ */

  const loadCaregivers = async () => {
    try {
      setIsLoadingCaregivers(true);

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

    } finally {
      setIsLoadingCaregivers(false);
    }
  };


  /* ============================================================
     INITIAL CAREGIVER LOAD
  ============================================================ */

  useEffect(() => {
    loadCaregivers();
  }, []);


  /* ============================================================
     FILTER PATIENTS
  ============================================================ */

  const filteredPatients = useMemo(() => {

    const search =
      searchTerm
        .trim()
        .toLowerCase();

    if (!search) {
      return patients;
    }

    return patients.filter(
      (patient) => {

        const name =
          patient.fullName
            ?.toLowerCase() || "";

        const email =
          patient.email
            ?.toLowerCase() || "";

        const gender =
          patient.gender
            ?.toLowerCase() || "";

        const caregiver =
          patient.caregiver?.fullName
            ?.toLowerCase() || "";

        return (
          name.includes(search) ||
          email.includes(search) ||
          gender.includes(search) ||
          caregiver.includes(search)
        );
      }
    );

  }, [
    patients,
    searchTerm,
  ]);


  /* ============================================================
     OPEN ASSIGNMENT MODAL
  ============================================================ */

  const openAssignmentModal = (
    patient
  ) => {

    setSelectedPatient(patient);

    setSelectedCaregiver(
      patient.caregiver?._id || ""
    );

    setAssignmentError("");
    setAssignmentSuccess("");

    setShowAssignmentModal(true);
  };


  /* ============================================================
     CLOSE ASSIGNMENT MODAL
  ============================================================ */

  const closeAssignmentModal = () => {

    if (isAssigning) {
      return;
    }

    setShowAssignmentModal(false);

    setSelectedPatient(null);

    setSelectedCaregiver("");

    setAssignmentError("");

    setAssignmentSuccess("");
  };


  /* ============================================================
     ASSIGN PATIENT
  ============================================================ */

  const handleAssignPatient = async () => {

    if (!selectedPatient) {
      return;
    }

    if (!selectedCaregiver) {

      setAssignmentError(
        "Please select a caregiver."
      );

      return;
    }


    try {

      setIsAssigning(true);

      setAssignmentError("");
      setAssignmentSuccess("");


      await axiosInstance.post(
        "/doctor/assign-caregiver",
        {
          patientId:
            selectedPatient._id,

          caregiverId:
            selectedCaregiver,
        }
      );


      setAssignmentSuccess(
        "Patient assigned successfully."
      );


      /*
       * Reload patients in the parent dashboard.
       *
       * This updates:
       * - PatientOverview
       * - AI Assessment
       * - Summary cards
       */

      if (onRefresh) {
        await onRefresh();
      }


      /*
       * Close modal after a successful
       * refresh.
       */

      setTimeout(() => {

        setShowAssignmentModal(false);

        setSelectedPatient(null);

        setSelectedCaregiver("");

        setAssignmentSuccess("");

      }, 700);


    } catch (error) {

      console.error(
        "Patient assignment error:",
        error
      );

      setAssignmentError(
        error.response?.data?.message ||
          "Unable to assign patient."
      );

    } finally {

      setIsAssigning(false);

    }
  };


  /* ============================================================
     PATIENT STATUS
  ============================================================ */

  const getPatientStatus = (
    patient
  ) => {

    if (
      patient.assignment?.status ===
      "active"
    ) {
      return "Assigned";
    }

    if (
      patient.assignment?.status ===
      "pending"
    ) {
      return "Pending";
    }

    return "Unassigned";
  };


  /* ============================================================
     STATUS CLASS
  ============================================================ */

  const getStatusClass = (
    patient
  ) => {

    const status =
      getPatientStatus(
        patient
      );

    if (status === "Assigned") {
      return "status-green";
    }

    if (status === "Pending") {
      return "status-orange";
    }

    return "status-gray";
  };


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section className="doctor-dashboard__section">

      {/* ======================================================
          SECTION HEADER
      ====================================================== */}

      <div className="doctor-section-header">

        <div>

          <span>
            PATIENT MANAGEMENT
          </span>

          <h2>
            My Patients
          </h2>

        </div>


        <div className="doctor-patient-header-actions">

          <button
            type="button"
            className="doctor-view-all"
          >
            View All
            <FaArrowRight />
          </button>

        </div>

      </div>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="doctor-patient-toolbar">

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

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="doctor-patient-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={onRefresh}
          >
            Retry
          </button>

        </div>
      )}


      {/* ======================================================
          LOADING
      ====================================================== */}

      {isLoading ? (

        <div className="doctor-patient-loading">

          <div className="doctor-patient-loading-spinner" />

          <span>
            Loading patients...
          </span>

        </div>

      ) : (

        <div className="doctor-patient-table-wrapper">

          <table className="doctor-patient-table">

            <thead>

              <tr>

                <th>
                  Patient
                </th>

                <th>
                  Age
                </th>

                <th>
                  Caregiver
                </th>

                <th>
                  Assignment
                </th>

                <th>
                  Email
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredPatients.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="doctor-patient-empty"
                  >
                    {searchTerm
                      ? "No patients match your search."
                      : "No patients are currently assigned to you."}
                  </td>

                </tr>

              ) : (

                filteredPatients.map(
                  (patient) => (

                    <tr
                      key={patient._id}
                    >

                      {/* PATIENT */}

                      <td>

                        <div className="doctor-patient-name">

                          <div className="doctor-patient-avatar">

                            {patient.fullName
                              ?.charAt(0)
                              ?.toUpperCase() || "P"}

                          </div>


                          <div>

                            <strong>
                              {patient.fullName}
                            </strong>

                            <span>
                              {patient.gender ||
                                "Not specified"}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* AGE */}

                      <td>
                        {patient.age ||
                          "—"}
                      </td>


                      {/* CAREGIVER */}

                      <td>

                        {patient.caregiver ? (

                          <div className="doctor-caregiver-name">

                            <strong>
                              {
                                patient
                                  .caregiver
                                  .fullName
                              }
                            </strong>

                            <span>
                              {
                                patient
                                  .caregiver
                                  .relationship ||
                                "Caregiver"
                              }
                            </span>

                          </div>

                        ) : (

                          <span className="doctor-no-caregiver">
                            Not assigned
                          </span>

                        )}

                      </td>


                      {/* ASSIGNMENT */}

                      <td>

                        <span
                          className={`doctor-status ${getStatusClass(
                            patient
                          )}`}
                        >
                          {getPatientStatus(
                            patient
                          )}
                        </span>

                      </td>


                      {/* EMAIL */}

                      <td>
                        {patient.email ||
                          "—"}
                      </td>


                      {/* ACTION */}

                      <td>

                        <button
                          type="button"
                          className="doctor-table-action"
                          onClick={() =>
                            openAssignmentModal(
                              patient
                            )
                          }
                        >

                          <FaUserPlus />

                          {patient.caregiver
                            ? "Reassign"
                            : "Assign"}

                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      )}


      {/* ======================================================
          ASSIGNMENT MODAL
      ====================================================== */}

      {showAssignmentModal &&
        selectedPatient && (

          <div className="doctor-assignment-overlay">

            <div className="doctor-assignment-modal">

              {/* HEADER */}

              <div className="doctor-assignment-modal-header">

                <div>

                  <span>
                    CAREGIVER ASSIGNMENT
                  </span>

                  <h3>
                    Assign Caregiver
                  </h3>

                </div>


                <button
                  type="button"
                  className="doctor-assignment-close"
                  onClick={
                    closeAssignmentModal
                  }
                  disabled={isAssigning}
                >
                  <FaTimes />
                </button>

              </div>


              {/* PATIENT */}

              <div className="doctor-assignment-patient">

                <div className="doctor-patient-avatar">

                  {selectedPatient.fullName
                    ?.charAt(0)
                    ?.toUpperCase() || "P"}

                </div>


                <div>

                  <strong>
                    {
                      selectedPatient.fullName
                    }
                  </strong>

                  <span>
                    Age{" "}
                    {
                      selectedPatient.age ||
                      "—"
                    }
                  </span>

                </div>

              </div>


              {/* CAREGIVER */}

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
                  disabled={
                    isAssigning ||
                    isLoadingCaregivers
                  }
                >

                  <option value="">
                    {isLoadingCaregivers
                      ? "Loading caregivers..."
                      : "Select a caregiver"}
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
                        {
                          caregiver.fullName
                        }
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* SUCCESS */}

              {assignmentSuccess && (

                <div className="doctor-assignment-success">

                  {assignmentSuccess}

                </div>

              )}


              {/* ERROR */}

              {assignmentError && (

                <div className="doctor-assignment-error">

                  {assignmentError}

                </div>

              )}


              {/* ACTIONS */}

              <div className="doctor-assignment-actions">

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
                    handleAssignPatient
                  }
                  disabled={
                    isAssigning ||
                    !selectedCaregiver
                  }
                >

                  {isAssigning
                    ? "Assigning..."
                    : "Assign Caregiver"}

                </button>

              </div>

            </div>

          </div>

        )}

    </section>
  );
};


export default PatientOverview;