import { useEffect, useState } from "react";

import {
  FaArrowLeft,
  FaBrain,
  FaCalendarAlt,
  FaUserMd,
  FaUserNurse,
  FaUserInjured,
  FaNotesMedical,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";

import axiosInstance from "../../api/axiosinstance.js";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";

import "./DoctorAIReportDetails.css";


const DoctorAIReportDetails = () => {

  const navigate = useNavigate();

  const { assessmentId } = useParams();

  const [assessment, setAssessment] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ============================================================
     LOAD REPORT
  ============================================================ */

  const loadReport = async () => {

    try {

      setIsLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          "/assessments/doctor"
        );

      const reports =
        response.data?.assessments || [];

      const foundReport =
        reports.find(
          (item) =>
            item._id === assessmentId
        );

      if (!foundReport) {

        setError(
          "AI assessment report not found."
        );

        return;
      }

      setAssessment(
        foundReport
      );

    } catch (error) {

      console.error(
        "Unable to load AI report:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load AI report."
      );

    } finally {

      setIsLoading(false);

    }

  };


  useEffect(() => {

    loadReport();

  }, [assessmentId]);


  /* ============================================================
     DATE
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
     PREDICTION CLASS
  ============================================================ */

  const getPredictionClass = (
    prediction
  ) => {

    switch (prediction) {

      case "Non Demented":
        return "report-result report-result--normal";

      case "Very Mild Dementia":
        return "report-result report-result--very-mild";

      case "Mild Dementia":
        return "report-result report-result--mild";

      case "Moderate Dementia":
        return "report-result report-result--moderate";

      default:
        return "report-result";

    }

  };


  /* ============================================================
     PROBABILITY
  ============================================================ */

  const probabilities = [

    {
      label: "Non Demented",
      value:
        assessment?.probabilities
          ?.nonDemented || 0,
      className:
        "probability-normal",
    },

    {
      label: "Very Mild Dementia",
      value:
        assessment?.probabilities
          ?.veryMildDementia || 0,
      className:
        "probability-very-mild",
    },

    {
      label: "Mild Dementia",
      value:
        assessment?.probabilities
          ?.mildDementia || 0,
      className:
        "probability-mild",
    },

    {
      label: "Moderate Dementia",
      value:
        assessment?.probabilities
          ?.moderateDementia || 0,
      className:
        "probability-moderate",
    },

  ];


  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {

    return (

      <div className="doctor-dashboard">

        <DoctorSidebar
          activePage="AI Reports"
        />

        <main className="doctor-dashboard__main">

          <DoctorHeader />

          <div className="doctor-dashboard__content">

            <div className="doctor-report-loading">

              <FaBrain />

              <strong>
                Loading AI report...
              </strong>

            </div>

          </div>

        </main>

      </div>

    );

  }


  /* ============================================================
     ERROR
  ============================================================ */

  if (error || !assessment) {

    return (

      <div className="doctor-dashboard">

        <DoctorSidebar
          activePage="AI Reports"
        />

        <main className="doctor-dashboard__main">

          <DoctorHeader />

          <div className="doctor-dashboard__content">

            <div className="doctor-report-error">

              <FaExclamationTriangle />

              <strong>
                {error ||
                  "Report not found."}
              </strong>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/doctor/ai-reports"
                  )
                }
              >
                <FaArrowLeft />
                Back to AI Reports
              </button>

            </div>

          </div>

        </main>

      </div>

    );

  }


  /* ============================================================
     USER INFORMATION
  ============================================================ */

  const patient =
    assessment.patientId;

  const doctor =
    assessment.doctorId;

  const caregiver =
    assessment.caregiverId;

  const createdBy =
    assessment.createdBy;


  const confidence =
    Number(
      assessment.confidence || 0
    );


  return (

    <div className="doctor-dashboard">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <DoctorSidebar
        activePage="AI Reports"
      />


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="doctor-dashboard__main">

        <DoctorHeader />


        <div className="doctor-dashboard__content doctor-report-page">


          {/* ==================================================
              BACK BUTTON
          ================================================== */}

          <button
            type="button"
            className="doctor-report-back"
            onClick={() =>
              navigate(
                "/doctor/ai-reports"
              )
            }
          >

            <FaArrowLeft />

            Back to AI Reports

          </button>


          {/* ==================================================
              HEADER
          ================================================== */}

          <section className="doctor-report-header">

            <div>

              <span>
                AI ASSESSMENT REPORT
              </span>

              <h1>
                Assessment Report
              </h1>

              <p>
                Detailed AI-assisted analysis
                for the selected patient.
              </p>

            </div>


            <div className="doctor-report-header__model">

              <FaBrain />

              <div>

                <span>
                  AI MODEL
                </span>

                <strong>
                  {assessment.model?.name ||
                    "EfficientNetB0"}
                </strong>

                <small>
                  Version{" "}
                  {assessment.model?.version ||
                    "1.0"}
                </small>

              </div>

            </div>

          </section>


          {/* ==================================================
              PATIENT CARD
          ================================================== */}

          <section className="doctor-dashboard__card doctor-report-patient-card">

            <div className="doctor-report-section-title">

              <div className="doctor-report-section-icon">
                <FaUserInjured />
              </div>

              <div>

                <span>
                  PATIENT
                </span>

                <h2>
                  Patient Information
                </h2>

              </div>

            </div>


            <div className="doctor-report-patient">

              {patient?.profilePicture?.url ? (

                <img
                  src={
                    patient.profilePicture.url
                  }
                  alt={
                    patient.fullName ||
                    "Patient"
                  }
                />

              ) : (

                <div className="doctor-report-patient__avatar">

                  {patient?.fullName
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "P"}

                </div>

              )}


              <div>

                <h3>
                  {patient?.fullName ||
                    "Unknown Patient"}
                </h3>

                <span>
                  Patient
                </span>

              </div>


              <div className="doctor-report-patient__details">

                <div>

                  <span>
                    Age
                  </span>

                  <strong>
                    {patient?.age || "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Gender
                  </span>

                  <strong>
                    {patient?.gender || "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Email
                  </span>

                  <strong>
                    {patient?.email || "—"}
                  </strong>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              AI RESULT
          ================================================== */}

          <section className="doctor-report-result-grid">


            {/* PREDICTION */}

            <div className="doctor-dashboard__card doctor-report-prediction-card">

              <div className="doctor-report-section-title">

                <div className="doctor-report-section-icon">
                  <FaBrain />
                </div>

                <div>

                  <span>
                    AI PREDICTION
                  </span>

                  <h2>
                    Predicted Classification
                  </h2>

                </div>

              </div>


              <div
                className={getPredictionClass(
                  assessment.prediction
                )}
              >

                <strong>
                  {assessment.prediction}
                </strong>

                <span>
                  AI predicted classification
                </span>

              </div>


              <div className="doctor-report-confidence">

                <div>

                  <span>
                    Confidence
                  </span>

                  <strong>
                    {confidence.toFixed(2)}%
                  </strong>

                </div>

                <div className="doctor-report-confidence__bar">

                  <div
                    style={{
                      width: `${Math.min(
                        confidence,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>


            {/* ASSESSMENT DATE */}

            <div className="doctor-dashboard__card doctor-report-date-card">

              <div className="doctor-report-section-title">

                <div className="doctor-report-section-icon">
                  <FaCalendarAlt />
                </div>

                <div>

                  <span>
                    ASSESSMENT
                  </span>

                  <h2>
                    Date & Time
                  </h2>

                </div>

              </div>


              <div className="doctor-report-date-large">

                <strong>
                  {formatDate(
                    assessment.createdAt
                  )}
                </strong>

                <span>
                  {formatTime(
                    assessment.createdAt
                  )}
                </span>

              </div>

            </div>

          </section>


          {/* ==================================================
              PROBABILITIES
          ================================================== */}

          <section className="doctor-dashboard__card doctor-report-probabilities">

            <div className="doctor-report-section-title">

              <div className="doctor-report-section-icon">
                <FaChartBar />
              </div>

              <div>

                <span>
                  CLASS PROBABILITIES
                </span>

                <h2>
                  AI Prediction Breakdown
                </h2>

              </div>

            </div>


            <div className="doctor-report-probability-list">

              {probabilities.map(
                (item) => (

                  <div
                    className="doctor-report-probability"
                    key={item.label}
                  >

                    <div className="doctor-report-probability__header">

                      <strong>
                        {item.label}
                      </strong>

                      <span>
                        {Number(
                          item.value
                        ).toFixed(2)}
                        %
                      </span>

                    </div>


                    <div className="doctor-report-probability__bar">

                      <div
                        className={
                          item.className
                        }
                        style={{
                          width: `${Math.min(
                            Number(
                              item.value
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          </section>


          {/* ==================================================
              PEOPLE
          ================================================== */}

          <section className="doctor-report-people-grid">


            {/* DOCTOR */}

            <div className="doctor-dashboard__card">

              <div className="doctor-report-section-title">

                <div className="doctor-report-section-icon">
                  <FaUserMd />
                </div>

                <div>

                  <span>
                    RESPONSIBLE DOCTOR
                  </span>

                  <h2>
                    Doctor
                  </h2>

                </div>

              </div>


              <div className="doctor-report-person">

                <div className="doctor-report-person__avatar">
                  {doctor?.fullName
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "D"}
                </div>

                <div>

                  <strong>
                    {doctor?.fullName ||
                      "Not available"}
                  </strong>

                  <span>
                    {doctor?.email ||
                      "—"}
                  </span>

                </div>

              </div>

            </div>


            {/* CAREGIVER */}

            <div className="doctor-dashboard__card">

              <div className="doctor-report-section-title">

                <div className="doctor-report-section-icon">
                  <FaUserNurse />
                </div>

                <div>

                  <span>
                    ASSIGNED CAREGIVER
                  </span>

                  <h2>
                    Caregiver
                  </h2>

                </div>

              </div>


              <div className="doctor-report-person">

                <div className="doctor-report-person__avatar">
                  {caregiver?.fullName
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "C"}
                </div>

                <div>

                  <strong>
                    {caregiver?.fullName ||
                      "Not assigned"}
                  </strong>

                  <span>
                    {caregiver?.email ||
                      "—"}
                  </span>

                </div>

              </div>

            </div>


            {/* ASSESSED BY */}

            <div className="doctor-dashboard__card">

              <div className="doctor-report-section-title">

                <div className="doctor-report-section-icon">
                  <FaCheckCircle />
                </div>

                <div>

                  <span>
                    ASSESSMENT PERFORMED BY
                  </span>

                  <h2>
                    Assessed By
                  </h2>

                </div>

              </div>


              <div className="doctor-report-person">

                <div className="doctor-report-person__avatar">
                  {createdBy?.fullName
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "U"}
                </div>

                <div>

                  <strong>
                    {createdBy?.fullName ||
                      "Previously recorded"}
                  </strong>

                  <span>
                    {createdBy?.role ===
                    "caregiver"
                      ? "Caregiver"
                      : "Doctor"}
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              NOTES
          ================================================== */}

          <section className="doctor-dashboard__card doctor-report-notes">

            <div className="doctor-report-section-title">

              <div className="doctor-report-section-icon">
                <FaNotesMedical />
              </div>

              <div>

                <span>
                  CLINICAL NOTES
                </span>

                <h2>
                  Assessment Notes
                </h2>

              </div>

            </div>


            {assessment.notes ? (

              <p>
                {assessment.notes}
              </p>

            ) : (

              <p className="doctor-report-notes--empty">
                No clinical notes were added
                for this assessment.
              </p>

            )}

          </section>


          {/* ==================================================
              DISCLAIMER
          ================================================== */}

          <div className="doctor-report-disclaimer">

            <FaBrain />

            <div>

              <strong>
                AI-assisted prediction
              </strong>

              <p>
                This AI assessment is intended
                to assist healthcare professionals
                in reviewing patient information.
                It should not be considered an
                independent medical diagnosis.
              </p>

            </div>

          </div>


        </div>

      </main>

    </div>

  );

};


export default DoctorAIReportDetails;