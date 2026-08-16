import { useEffect, useState } from "react";

import {
  FaBrain,
  FaArrowRight,
  FaSpinner,
} from "react-icons/fa";

import {
  getLatestDoctorAssessment,
} from "../../api/assessment.api.js";

import { useNavigate } from "react-router-dom";


const PredictionCard = () => {

  const navigate = useNavigate();


  /* ============================================================
     STATE
  ============================================================ */

  const [assessment, setAssessment] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ============================================================
     LOAD LATEST ASSESSMENT
  ============================================================ */

  const loadLatestAssessment =
    async () => {

      try {

        setIsLoading(true);
        setError("");

        const response =
          await getLatestDoctorAssessment();

        setAssessment(
          response.assessment || null
        );

      } catch (error) {

        console.error(
          "Unable to load latest assessment:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load latest assessment."
        );

      } finally {

        setIsLoading(false);

      }
    };


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadLatestAssessment();

  }, []);


  /* ============================================================
     VIEW REPORT
  ============================================================ */

  const handleViewReport = () => {

    if (!assessment) {
      return;
    }

    /*
     * Open AI Reports page.
     *
     * Pass assessment ID so the reports page
     * can identify the selected report later.
     */

    navigate(
      `/doctor/ai-reports?assessmentId=${assessment._id}`
    );

  };


  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {

    return (
      <section className="doctor-dashboard__card doctor-prediction">

        <div className="doctor-card-header">

          <div>

            <span>
              AI ASSESSMENT
            </span>

            <h2>
              Latest AI Report
            </h2>

          </div>

          <div className="doctor-card-icon">
            <FaBrain />
          </div>

        </div>


        <div
          style={{
            minHeight: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            color: "#7a8797",
            fontSize: "14px",
          }}
        >

          <FaSpinner
            className="prediction-spinner"
          />

          Loading latest assessment...

        </div>

      </section>
    );
  }


  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {

    return (
      <section className="doctor-dashboard__card doctor-prediction">

        <div className="doctor-card-header">

          <div>

            <span>
              AI ASSESSMENT
            </span>

            <h2>
              Latest AI Report
            </h2>

          </div>

          <div className="doctor-card-icon">
            <FaBrain />
          </div>

        </div>


        <div
          style={{
            minHeight: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#a43c3c",
            fontSize: "14px",
            padding: "20px",
          }}
        >

          {error}

        </div>

      </section>
    );
  }


  /* ============================================================
     EMPTY
  ============================================================ */

  if (!assessment) {

    return (
      <section className="doctor-dashboard__card doctor-prediction">

        <div className="doctor-card-header">

          <div>

            <span>
              AI ASSESSMENT
            </span>

            <h2>
              Latest AI Report
            </h2>

          </div>

          <div className="doctor-card-icon">
            <FaBrain />
          </div>

        </div>


        <div
          style={{
            minHeight: "220px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "20px",
          }}
        >

          <FaBrain
            style={{
              fontSize: "34px",
              color: "#9aabc0",
              marginBottom: "12px",
            }}
          />

          <strong
            style={{
              color: "#34445a",
              fontSize: "15px",
              marginBottom: "6px",
            }}
          >
            No AI assessments yet
          </strong>

          <span
            style={{
              color: "#8996a7",
              fontSize: "13px",
            }}
          >
            Completed assessments will
            appear here.
          </span>

        </div>

      </section>
    );
  }


  /* ============================================================
     ASSESSMENT DATA
  ============================================================ */

  const patient =
    assessment.patientId;

  const patientName =
    patient?.fullName ||
    "Unknown Patient";

  const patientInitial =
    patientName
      .charAt(0)
      .toUpperCase();

  const prediction =
    assessment.prediction ||
    "—";

  const confidence =
    Number(
      assessment.confidence
    ) || 0;

  const assessmentDate =
    assessment.createdAt
      ? new Date(
          assessment.createdAt
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )
      : "—";


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section className="doctor-dashboard__card doctor-prediction">

      <div className="doctor-card-header">

        <div>

          <span>
            AI ASSESSMENT
          </span>

          <h2>
            Latest AI Report
          </h2>

        </div>

        <div className="doctor-card-icon">
          <FaBrain />
        </div>

      </div>


      <div className="doctor-prediction__content">

        {/* PATIENT */}

        <div className="doctor-prediction__patient">

          <div className="doctor-patient-avatar doctor-patient-avatar--large">

            {patientInitial}

          </div>

          <div>

            <strong>
              {patientName}
            </strong>

            <span>
              MRI Assessment
            </span>

          </div>

        </div>


        {/* RESULT */}

        <div className="doctor-prediction__result">

          <span>
            AI Prediction
          </span>

          <strong>
            {prediction}
          </strong>


          <div className="doctor-confidence">

            <div className="doctor-confidence__label">

              <span>
                Confidence
              </span>

              <strong>
                {confidence.toFixed(2)}%
              </strong>

            </div>


            <div className="doctor-confidence__bar">

              <div
                style={{
                  width: `${Math.min(
                    Math.max(
                      confidence,
                      0
                    ),
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

        </div>


        {/* DATE */}

        <div className="doctor-prediction__date">

          <span>
            Assessment Date
          </span>

          <strong>
            {assessmentDate}
          </strong>

        </div>

      </div>


      {/* ======================================================
          VIEW FULL REPORT
      ====================================================== */}

      <button
        type="button"
        className="doctor-report-button"
        onClick={
          handleViewReport
        }
      >

        View Full Report

        <FaArrowRight />

      </button>

    </section>
  );
};


export default PredictionCard;