import { useEffect, useMemo, useState } from "react";

import {
  FaArrowRight,
  FaPlus,
  FaTimes,
  FaUserInjured,
  FaUserNurse,
  FaSearch,
  FaCheckCircle,
} from "react-icons/fa";

import axiosInstance from "../../api/axiosinstance.js";

const PatientOverview = () => {
  /* ============================================================
     DATA
  ============================================================ */

  const [patients, setPatients] =
    useState([]);

  const [caregivers, setCaregivers] =
    useState([]);

  /* ============================================================
     UI STATE
  ============================================================ */

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showAssignment, setShowAssignment] =
    useState(false);

  const [selectedPatient, setSelectedPatient] =
    useState("");

  const [selectedCaregiver, setSelectedCaregiver] =
    useState("");

  const [isAssigning, setIsAssigning] =
    useState(false);

  const [assignmentError, setAssignmentError] =
    useState("");

  const [assignmentSuccess, setAssignmentSuccess] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  /* ============================================================
     LOAD PATIENTS + CAREGIVERS
  ============================================================ */

  const loadAssignmentData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [
        patientsResponse,
        caregiversResponse,
      ] = await Promise.all([
        axiosInstance.get(
          "/doctor/patients"
        ),

        axiosInstance.get(
          "/doctor/caregivers"
        ),
      ]);

      setPatients(
        patientsResponse.data.patients || []
      );

      setCaregivers(
        caregiversResponse.data.caregivers || []
      );
    } catch (err) {
      console.error(
        "Unable to load doctor assignment data:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load patients and caregivers."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignmentData();
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
      (patient) =>
        patient.fullName
          ?.toLowerCase()
          .includes(search) ||
        patient.email
          ?.toLowerCase()
          .includes(search)
    );
  }, [patients, searchTerm]);

  /* ============================================================
     HELPERS
  ============================================================ */

  const getInitials = (name = "") => {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]?.toUpperCase()
      )
      .join("");
  };

  const formatGender = (gender) => {
    if (!gender) {
      return "Not specified";
    }

    return gender
      .replace(
        "prefer-not-to-say",
        "Prefer not to say"
      )
      .replace(
        /^./,
        (letter) =>
          letter.toUpperCase()
      );
  };

  /* ============================================================
     OPEN ASSIGNMENT PANEL
  ============================================================ */

  const openAssignmentPanel = () => {
    setAssignmentError("");
    setAssignmentSuccess("");
    setSelectedPatient("");
    setSelectedCaregiver("");
    setShowAssignment(true);
  };

  /* ============================================================
     CLOSE ASSIGNMENT PANEL
  ============================================================ */

  const closeAssignmentPanel = () => {
    if (isAssigning) {
      return;
    }

    setShowAssignment(false);
    setAssignmentError("");
    setAssignmentSuccess("");
    setSelectedPatient("");
    setSelectedCaregiver("");
  };

  /* ============================================================
     ASSIGN PATIENT
  ============================================================ */

  const handleAssignPatient = async (
    event
  ) => {
    event.preventDefault();

    setAssignmentError("");
    setAssignmentSuccess("");

    if (!selectedPatient) {
      setAssignmentError(
        "Please select a patient."
      );
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

      const response =
        await axiosInstance.post(
          "/doctor/assign-patient",
          {
            patientId:
              selectedPatient,

            caregiverId:
              selectedCaregiver,
          }
        );

      setAssignmentSuccess(
        response.data?.message ||
          "Patient assigned successfully."
      );

      /*
       * Refresh the table so the new
       * caregiver relationship appears.
       */
      await loadAssignmentData();

      /*
       * Close the panel after a short
       * successful state.
       */
      setTimeout(() => {
        setShowAssignment(false);
        setAssignmentSuccess("");
        setSelectedPatient("");
        setSelectedCaregiver("");
      }, 1200);
    } catch (err) {
      console.error(
        "Patient assignment error:",
        err
      );

      setAssignmentError(
        err.response?.data?.message ||
          "Unable to assign patient."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (isLoading) {
    return (
      <section className="doctor-dashboard__section">

        <div className="doctor-section-header">

          <div>
            <span>
              PATIENT MANAGEMENT
            </span>

            <h2>
              My Patients
            </h2>
          </div>

        </div>

        <div className="doctor-patient-loading">
          Loading patients...
        </div>

      </section>
    );
  }

  /* ============================================================
     ERROR STATE
  ============================================================ */

  if (error) {
    return (
      <section className="doctor-dashboard__section">

        <div className="doctor-section-header">

          <div>
            <span>
              PATIENT MANAGEMENT
            </span>

            <h2>
              My Patients
            </h2>
          </div>

          <button
            type="button"
            className="doctor-view-all"
            onClick={loadAssignmentData}
          >
            Retry
          </button>

        </div>

        <div className="doctor-patient-error">
          {error}
        </div>

      </section>
    );
  }

  return (
    <section className="doctor-dashboard__section">

      {/* ======================================================
          HEADER
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

        <button
          type="button"
          className="doctor-assign-button"
          onClick={openAssignmentPanel}
        >
          <FaPlus />
          Assign Patient
        </button>

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

        </div>

        <span>
          {patients.length}{" "}
          {patients.length === 1
            ? "patient"
            : "patients"}{" "}
          registered
        </span>

      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="doctor-patient-table-wrapper">

        <table className="doctor-patient-table">

          <thead>
            <tr>
              <th>Patient</th>
              <th>Age</th>
              <th>Caregiver</th>
              <th>Status</th>
              <th>Last Assessment</th>
              <th>Risk Level</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredPatients.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="doctor-patient-empty"
                >
                  <FaUserInjured />

                  <strong>
                    No patients found
                  </strong>

                  <span>
                    {searchTerm
                      ? "Try a different search."
                      : "No patients have registered yet."}
                  </span>
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
                          {getInitials(
                            patient.fullName
                          )}
                        </div>

                        <div>

                          <strong>
                            {patient.fullName}
                          </strong>

                          <span>
                            {formatGender(
                              patient.gender
                            )}
                          </span>

                        </div>

                      </div>
                    </td>

                    {/* AGE */}

                    <td>
                      {patient.age || "—"}
                    </td>

                    {/* CAREGIVER */}

                    <td>
  {patient.caregiver ? (
    <div className="doctor-assigned-caregiver">
      <div className="doctor-assigned-caregiver__avatar">
        {getInitials(
          patient.caregiver.fullName
        )}
      </div>

      <div>
        <strong>
          {patient.caregiver.fullName}
        </strong>

        <span>
          {patient.assignment?.status ===
          "active"
            ? "Active assignment"
            : "Assigned"}
        </span>
      </div>
    </div>
  ) : (
    <span className="doctor-caregiver-name">
      Not assigned
    </span>
  )}
</td>

                    {/* STATUS */}

                    <td>
                      <span className="doctor-status status-blue">
                        Registered
                      </span>
                    </td>

                    {/* ASSESSMENT */}

                    <td>
                      —
                    </td>

                    {/* RISK */}

                    <td>
                      <span className="doctor-status status-orange">
                        Monitoring
                      </span>
                    </td>

                    {/* ACTION */}

                    <td>
                      <button
  type="button"
  className="doctor-table-action"
  onClick={() => {
    setSelectedPatient(
      patient._id
    );

    openAssignmentPanel();
  }}
>
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

      {/* ======================================================
          ASSIGNMENT PANEL
      ====================================================== */}

      {showAssignment && (
        <div className="doctor-assignment-overlay">

          <div className="doctor-assignment-modal">

            {/* HEADER */}

            <div className="doctor-assignment-modal__header">

              <div>
                <span>
                  PATIENT MANAGEMENT
                </span>

                <h2>
                  Assign Patient
                </h2>

                <p>
                  Connect a patient with
                  their caregiver.
                </p>
              </div>

              <button
                type="button"
                className="doctor-assignment-close"
                onClick={
                  closeAssignmentPanel
                }
                disabled={isAssigning}
              >
                <FaTimes />
              </button>

            </div>

            {/* FORM */}

            <form
              className="doctor-assignment-form"
              onSubmit={
                handleAssignPatient
              }
            >

              {/* PATIENT */}

              <div className="doctor-assignment-field">

                <label>
                  <FaUserInjured />
                  Patient
                </label>

                <select
                  value={
                    selectedPatient
                  }
                  onChange={(event) =>
                    setSelectedPatient(
                      event.target.value
                    )
                  }
                  disabled={isAssigning}
                >
                  <option value="">
                    Select a patient
                  </option>

                  {patients.map(
                    (patient) => (
                      <option
                        key={patient._id}
                        value={patient._id}
                      >
                        {patient.fullName} —{" "}
                        {patient.age} years
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* CAREGIVER */}

              <div className="doctor-assignment-field">

                <label>
                  <FaUserNurse />
                  Caregiver
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
                  disabled={isAssigning}
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

              {/* ERROR */}

              {assignmentError && (
                <div className="doctor-assignment-message doctor-assignment-message--error">
                  {assignmentError}
                </div>
              )}

              {/* SUCCESS */}

              {assignmentSuccess && (
                <div className="doctor-assignment-message doctor-assignment-message--success">

                  <FaCheckCircle />

                  {assignmentSuccess}

                </div>
              )}

              {/* ACTIONS */}

              <div className="doctor-assignment-actions">

                <button
                  type="button"
                  className="doctor-assignment-cancel"
                  onClick={
                    closeAssignmentPanel
                  }
                  disabled={isAssigning}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="doctor-assignment-submit"
                  disabled={isAssigning}
                >
                  {isAssigning
                    ? "Assigning..."
                    : "Assign Patient"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
};

export default PatientOverview;