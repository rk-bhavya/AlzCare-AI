import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaUserInjured,
  FaBrain,
  FaUserNurse,
  FaCalendarAlt,
  FaSpinner,
} from "react-icons/fa";

import axiosInstance from "../../api/axiosinstance.js";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";

import "./DoctorPatientDetails.css";


const DoctorPatientDetails = () => {

  const { patientId } = useParams();

  const navigate = useNavigate();


  /* ============================================================
     STATE
  ============================================================ */

  const [patient, setPatient] =
    useState(null);

  const [assessments, setAssessments] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ============================================================
     LOAD PATIENT + ASSESSMENTS
  ============================================================ */

  const loadPatientDetails =
    async () => {

      try {

        setIsLoading(true);
        setError("");


        /* ------------------------------------------------------
           LOAD DOCTOR PATIENTS

           We already have this endpoint and it contains
           caregiver/assignment information.
        ------------------------------------------------------ */

        const patientResponse =
          await axiosInstance.get(
            "/doctor/patients"
          );


        const patients =
          patientResponse.data?.patients ||
          [];


        const selectedPatient =
          patients.find(
            (item) =>
              item._id === patientId
          );


        if (!selectedPatient) {

          setError(
            "Patient not found or you do not have access to this patient."
          );

          return;

        }


        setPatient(
          selectedPatient
        );


        /* ------------------------------------------------------
           LOAD ASSESSMENT HISTORY
        ------------------------------------------------------ */

        const assessmentResponse =
          await axiosInstance.get(
            `/assessments/patient/${patientId}`
          );


        setAssessments(
          assessmentResponse.data?.assessments ||
            []
        );

      } catch (error) {

        console.error(
          "Unable to load patient details:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load patient details."
        );

      } finally {

        setIsLoading(false);

      }

    };


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadPatientDetails();

  }, [patientId]);


  /* ============================================================
     LATEST ASSESSMENT
  ============================================================ */

  const latestAssessment =
    assessments.length > 0
      ? assessments[0]
      : null;


  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = (date) => {

    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  /* ============================================================
     RENDER LOADING
  ============================================================ */

  if (isLoading) {

    return (
      <div className="doctor-dashboard">

        <DoctorSidebar
          activePage="My Patients"
        />

        <main className="doctor-dashboard__main">

          <DoctorHeader />

          <div className="doctor-patient-details-loading">

            <FaSpinner />

            Loading patient details...

          </div>

        </main>

      </div>
    );

  }


  /* ============================================================
     RENDER ERROR
  ============================================================ */

  if (error || !patient) {

    return (
      <div className="doctor-dashboard">

        <DoctorSidebar
          activePage="My Patients"
        />

        <main className="doctor-dashboard__main">

          <DoctorHeader />

          <div className="doctor-patient-details-error">

            <FaUserInjured />

            <strong>
              Unable to load patient
            </strong>

            <span>
              {error ||
                "Patient information is unavailable."}
            </span>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/doctor/patients"
                )
              }
            >
              <FaArrowLeft />
              Back to Patients
            </button>

          </div>

        </main>

      </div>
    );

  }


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="doctor-dashboard">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <DoctorSidebar
        activePage="My Patients"
      />


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="doctor-dashboard__main">

        <DoctorHeader />


        <div className="doctor-dashboard__content">


          {/* ==================================================
              BACK BUTTON
          ================================================== */}

          <button
            type="button"
            className="doctor-details-back"
            onClick={() =>
              navigate(
                "/doctor/patients"
              )
            }
          >

            <FaArrowLeft />

            Back to My Patients

          </button>


          {/* ==================================================
              PATIENT HEADER
          ================================================== */}

          <section className="doctor-dashboard__card doctor-patient-profile-card">

            <div className="doctor-patient-profile">

              {patient.profilePicture?.url ? (

                <img
                  src={
                    patient.profilePicture.url
                  }
                  alt={
                    patient.fullName
                  }
                  className="doctor-patient-profile__image"
                />

              ) : (

                <div className="doctor-patient-profile__avatar">

                  {patient.fullName
                    ?.charAt(0)
                    .toUpperCase()}

                </div>

              )}


              <div className="doctor-patient-profile__info">

                <span>
                  PATIENT PROFILE
                </span>

                <h1>
                  {patient.fullName}
                </h1>

                <p>
                  Patient ID:{" "}
                  {patient._id}
                </p>

              </div>

            </div>


            <div className="doctor-patient-profile__status">

              <span>
                Assignment
              </span>

              <strong>
                {patient.assignment?.status ||
                  "Unassigned"}
              </strong>

            </div>

          </section>


          {/* ==================================================
              BASIC INFORMATION
          ================================================== */}

          <section className="doctor-dashboard__card">

            <div className="doctor-card-header">

              <div>

                <span>
                  PATIENT INFORMATION
                </span>

                <h2>
                  Basic Details
                </h2>

              </div>

              <FaUserInjured />

            </div>


            <div className="doctor-patient-info-grid">

              <div>

                <span>
                  Age
                </span>

                <strong>
                  {patient.age || "—"}
                </strong>

              </div>


              <div>

                <span>
                  Gender
                </span>

                <strong>
                  {patient.gender || "—"}
                </strong>

              </div>


              <div>

                <span>
                  Email
                </span>

                <strong>
                  {patient.email || "—"}
                </strong>

              </div>


              <div>

                <span>
                  Phone
                </span>

                <strong>
                  {patient.phone || "—"}
                </strong>

              </div>

            </div>

          </section>


          {/* ==================================================
              CAREGIVER
          ================================================== */}

          <section className="doctor-dashboard__card">

            <div className="doctor-card-header">

              <div>

                <span>
                  CARE SUPPORT
                </span>

                <h2>
                  Assigned Caregiver
                </h2>

              </div>

              <FaUserNurse />

            </div>


            {patient.caregiver ? (

              <div className="doctor-details-caregiver">

                <div className="doctor-details-caregiver__avatar">

                  {patient.caregiver.fullName
                    ?.charAt(0)
                    .toUpperCase()}

                </div>

                <div>

                  <strong>
                    {
                      patient.caregiver
                        .fullName
                    }
                  </strong>

                  <span>
                    {
                      patient.caregiver
                        .relationship ||
                      "Caregiver"
                    }
                  </span>

                  <small>
                    {
                      patient.caregiver
                        .email ||
                      patient.caregiver
                        .phone ||
                      "Contact information unavailable"
                    }
                  </small>

                </div>

              </div>

            ) : (

              <div className="doctor-details-no-caregiver">

                No caregiver is currently assigned
                to this patient.

              </div>

            )}

          </section>


          {/* ==================================================
              LATEST AI ASSESSMENT
          ================================================== */}

          <section className="doctor-dashboard__card">

            <div className="doctor-card-header">

              <div>

                <span>
                  AI ASSESSMENT
                </span>

                <h2>
                  Latest Assessment
                </h2>

              </div>

              <FaBrain />

            </div>


            {latestAssessment ? (

              <div className="doctor-latest-assessment">

                <div className="doctor-assessment-result">

                  <span>
                    Prediction
                  </span>

                  <strong>
                    {
                      latestAssessment
                        .prediction
                    }
                  </strong>

                </div>


                <div className="doctor-assessment-result">

                  <span>
                    Confidence
                  </span>

                  <strong>
                    {
                      latestAssessment
                        .confidence
                    }%
                  </strong>

                </div>


                <div className="doctor-assessment-result">

                  <span>
                    Assessment Date
                  </span>

                  <strong>
                    {formatDate(
                      latestAssessment
                        .createdAt
                    )}
                  </strong>

                </div>


                <div className="doctor-assessment-result">

                  <span>
                    Model
                  </span>

                  <strong>
                    {
                      latestAssessment
                        .model?.name ||
                      "EfficientNetB0"
                    }
                  </strong>

                </div>

              </div>

            ) : (

              <div className="doctor-no-assessment">

                <FaBrain />

                <strong>
                  No AI assessment yet
                </strong>

                <span>
                  An assessment will appear here
                  after an MRI or CT scan is analyzed.
                </span>

              </div>

            )}

          </section>


          {/* ==================================================
              ASSESSMENT HISTORY
          ================================================== */}

          <section className="doctor-dashboard__card">

            <div className="doctor-card-header">

              <div>

                <span>
                  HISTORY
                </span>

                <h2>
                  Assessment History
                </h2>

              </div>

              <FaCalendarAlt />

            </div>


            {assessments.length === 0 ? (

              <div className="doctor-no-assessment">

                <FaCalendarAlt />

                <strong>
                  No assessment history
                </strong>

              </div>

            ) : (

              <div className="doctor-assessment-history">

                {assessments.map(
                  (assessment) => (

                    <div
                      className="doctor-assessment-history__item"
                      key={
                        assessment._id
                      }
                    >

                      <div>

                        <strong>
                          {
                            assessment
                              .prediction
                          }
                        </strong>

                        <span>
                          {
                            assessment
                              .confidence
                          }% confidence
                        </span>

                      </div>


                      <div>

                        <span>
                          {formatDate(
                            assessment
                              .createdAt
                          )}
                        </span>

                        <small>
                          {
                            assessment
                              .model?.name ||
                            "EfficientNetB0"
                          }
                        </small>

                      </div>

                    </div>

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


export default DoctorPatientDetails;