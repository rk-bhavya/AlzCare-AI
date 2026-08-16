import { useEffect, useState } from "react";

import {
  FaNotesMedical,
  FaSave,
  FaSpinner,
  FaUserInjured,
} from "react-icons/fa";

import {
  useSearchParams,
} from "react-router-dom";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";

import axiosInstance from "../../api/axiosinstance.js";

import "./DoctorClinicalNotes.css";


const DoctorClinicalNotes = () => {

  /* ============================================================
     URL PARAMETERS
  ============================================================ */

  const [searchParams] =
    useSearchParams();

  const patientIdFromUrl =
    searchParams.get("patientId");


  /* ============================================================
     PATIENT DATA
  ============================================================ */

  const [patients, setPatients] =
    useState([]);

  const [selectedPatient, setSelectedPatient] =
    useState(
      patientIdFromUrl || ""
    );


  /* ============================================================
     NOTE DATA
  ============================================================ */

  const [note, setNote] =
    useState("");

  const [notes, setNotes] =
    useState([]);


  /* ============================================================
     LOADING / STATUS
  ============================================================ */

  const [isLoadingPatients, setIsLoadingPatients] =
    useState(true);

  const [isLoadingNotes, setIsLoadingNotes] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  /* ============================================================
     LOAD PATIENTS
  ============================================================ */

  const loadPatients = async () => {

    try {

      setIsLoadingPatients(true);
      setError("");

      const response =
        await axiosInstance.get(
          "/doctor/patients"
        );


      const loadedPatients =
        response.data?.patients || [];


      setPatients(
        loadedPatients
      );


      /* --------------------------------------------------------
         AUTOMATICALLY SELECT PATIENT FROM URL
      -------------------------------------------------------- */

      if (
        patientIdFromUrl &&
        loadedPatients.some(
          (patient) =>
            patient._id ===
            patientIdFromUrl
        )
      ) {

        setSelectedPatient(
          patientIdFromUrl
        );

      }

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

      setIsLoadingPatients(
        false
      );

    }
  };


  /* ============================================================
     LOAD PATIENT CLINICAL NOTES
  ============================================================ */

  const loadNotes = async (
    patientId
  ) => {

    if (!patientId) {

      setNotes([]);

      return;

    }


    try {

      setIsLoadingNotes(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/clinical-notes/patient/${patientId}`
        );


      setNotes(
        response.data?.notes || []
      );

    } catch (error) {

      console.error(
        "Unable to load clinical notes:",
        error
      );

      setNotes([]);

      /*
       * Do not show an error here if
       * there are simply no notes yet.
       */

      if (
        error.response?.status !==
        404
      ) {

        setError(
          error.response?.data?.message ||
            "Unable to load clinical notes."
        );

      }

    } finally {

      setIsLoadingNotes(
        false
      );

    }
  };


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadPatients();

  }, []);


  /* ============================================================
     LOAD NOTES WHEN PATIENT CHANGES
  ============================================================ */

  useEffect(() => {

    loadNotes(
      selectedPatient
    );

  }, [
    selectedPatient,
  ]);


  /* ============================================================
     SAVE CLINICAL NOTE
  ============================================================ */

  const handleSaveNote =
    async () => {

      /* --------------------------------------------------------
         VALIDATE PATIENT
      -------------------------------------------------------- */

      if (
        !selectedPatient
      ) {

        setError(
          "Please select a patient."
        );

        setMessage("");

        return;

      }


      /* --------------------------------------------------------
         VALIDATE NOTE
      -------------------------------------------------------- */

      if (
        !note.trim()
      ) {

        setError(
          "Please enter a clinical note."
        );

        setMessage("");

        return;

      }


      try {

        setIsSaving(true);

        setError("");
        setMessage("");


        /* ------------------------------------------------------
           CREATE NOTE
        ------------------------------------------------------ */

        const response =
          await axiosInstance.post(
            "/clinical-notes",
            {
              patientId:
                selectedPatient,

              note:
                note.trim(),
            }
          );


        /* ------------------------------------------------------
           ADD NEW NOTE TO TOP OF HISTORY
        ------------------------------------------------------ */

        if (
          response.data?.note
        ) {

          setNotes(
            (previous) => [
              response.data.note,
              ...previous,
            ]
          );

        }


        /* ------------------------------------------------------
           CLEAR TEXTAREA
        ------------------------------------------------------ */

        setNote("");


        setMessage(
          "Clinical note saved successfully."
        );

      } catch (error) {

        console.error(
          "Unable to save clinical note:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to save clinical note."
        );

        setMessage("");

      } finally {

        setIsSaving(
          false
        );

      }
    };


  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate =
    (date) => {

      if (!date) {
        return "—";
      }


      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    };


  /* ============================================================
     SELECTED PATIENT OBJECT
  ============================================================ */

  const selectedPatientData =
    patients.find(
      (patient) =>
        patient._id ===
        selectedPatient
    );


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="doctor-dashboard">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <DoctorSidebar
        activePage="Clinical Notes"
      />


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="doctor-dashboard__main">

        <DoctorHeader />


        <div className="doctor-dashboard__content doctor-clinical-notes">


          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section className="doctor-clinical-notes__header">

            <div>

              <span>
                CLINICAL DOCUMENTATION
              </span>

              <h1>
                Clinical Notes
              </h1>

              <p>
                Add and review clinical notes for
                your patients.
              </p>

            </div>

          </section>


          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {error && (

            <div className="doctor-clinical-notes__error">

              {error}

            </div>

          )}


          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {message && (

            <div className="doctor-clinical-notes__success">

              {message}

            </div>

          )}


          {/* ==================================================
              PATIENT SELECTION
          ================================================== */}

          <section className="doctor-dashboard__card doctor-clinical-notes__card">

            <div className="doctor-clinical-notes__card-header">

              <div className="doctor-clinical-notes__icon">

                <FaUserInjured />

              </div>


              <div>

                <h2>
                  Select Patient
                </h2>

                <p>
                  Choose the patient for whom you
                  want to add a clinical note.
                </p>

              </div>

            </div>


            <div className="doctor-clinical-notes__select">

              <label>
                Patient
              </label>


              <select
                value={
                  selectedPatient
                }
                onChange={(event) => {

                  setSelectedPatient(
                    event.target.value
                  );

                  setMessage("");
                  setError("");

                }}
                disabled={
                  isLoadingPatients
                }
              >

                <option value="">

                  {isLoadingPatients
                    ? "Loading patients..."
                    : "Select a patient"}

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

                      {
                        patient.fullName
                      }

                    </option>

                  )
                )}

              </select>

            </div>


            {/* SELECTED PATIENT INFO */}

            {selectedPatientData && (

              <div
                style={{
                  marginTop: "15px",
                  fontSize: "14px",
                  color: "#66768a",
                }}
              >

                Adding notes for:

                <strong
                  style={{
                    marginLeft: "5px",
                  }}
                >
                  {
                    selectedPatientData.fullName
                  }
                </strong>

              </div>

            )}

          </section>


          {/* ==================================================
              ADD NOTE
          ================================================== */}

          <section className="doctor-dashboard__card doctor-clinical-notes__card">

            <div className="doctor-clinical-notes__card-header">

              <div className="doctor-clinical-notes__icon">

                <FaNotesMedical />

              </div>


              <div>

                <h2>
                  Add Clinical Note
                </h2>

                <p>
                  Record observations, follow-up details,
                  or other clinical information.
                </p>

              </div>

            </div>


            <textarea
              className="doctor-clinical-notes__textarea"
              placeholder="Enter clinical notes..."
              value={
                note
              }
              onChange={(event) =>
                setNote(
                  event.target.value
                )
              }
              rows={7}
              disabled={
                !selectedPatient ||
                isSaving
              }
            />


            <div className="doctor-clinical-notes__actions">

              <span>
                {note.length} characters
              </span>


              <button
                type="button"
                onClick={
                  handleSaveNote
                }
                disabled={
                  !selectedPatient ||
                  !note.trim() ||
                  isSaving
                }
              >

                {isSaving ? (

                  <>

                    <FaSpinner />

                    Saving...

                  </>

                ) : (

                  <>

                    <FaSave />

                    Save Clinical Note

                  </>

                )}

              </button>

            </div>

          </section>


          {/* ==================================================
              NOTE HISTORY
          ================================================== */}

          <section className="doctor-dashboard__card doctor-clinical-notes__card">

            <div className="doctor-clinical-notes__card-header">

              <div className="doctor-clinical-notes__icon">

                <FaNotesMedical />

              </div>


              <div>

                <h2>
                  Previous Notes
                </h2>

                <p>
                  Clinical notes recorded for the
                  selected patient.
                </p>

              </div>

            </div>


            {/* NO PATIENT */}

            {!selectedPatient ? (

              <div className="doctor-clinical-notes__empty">

                Select a patient to view
                clinical notes.

              </div>


            ) : isLoadingNotes ? (


              /* LOADING NOTES */

              <div className="doctor-clinical-notes__empty">

                <FaSpinner />

                Loading notes...

              </div>


            ) : notes.length === 0 ? (


              /* NO NOTES */

              <div className="doctor-clinical-notes__empty">

                <FaNotesMedical />

                <span>
                  No clinical notes recorded
                  for this patient yet.
                </span>

              </div>


            ) : (


              /* NOTE HISTORY */

              <div className="doctor-clinical-notes__history">

                {notes.map(
                  (item) => (

                    <article
                      key={
                        item._id
                      }
                      className="doctor-clinical-note"
                    >

                      <div>

                        <strong>

                          {
                            item.doctorId
                              ?.fullName ||
                            "Doctor"
                          }

                        </strong>


                        <span>

                          {formatDate(
                            item.createdAt
                          )}

                        </span>

                      </div>


                      <p>

                        {
                          item.note
                        }

                      </p>

                    </article>

                  )
                )}

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
};


export default DoctorClinicalNotes;