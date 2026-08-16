import { useEffect, useMemo, useState } from "react";

import {
  FaBrain,
  FaSearch,
  FaSyncAlt,
  FaEye,
  FaUserInjured,
  FaUserMd,
  FaUserNurse,
  FaCalendarAlt,
  FaChartBar,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import {
  getDoctorAssessments,
} from "../../api/assessment.api.js";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";

import "./DoctorAIReports.css";


const DoctorAIReports = () => {

  const navigate = useNavigate();


  /* ============================================================
     STATE
  ============================================================ */

  const [assessments, setAssessments] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [predictionFilter, setPredictionFilter] =
    useState("All");


  /* ============================================================
     LOAD REPORTS
  ============================================================ */

  const loadReports = async () => {

    try {

      setIsLoading(true);
      setError("");

      const response =
        await getDoctorAssessments();

      setAssessments(
        response.assessments || []
      );

    } catch (error) {

      console.error(
        "Unable to load AI reports:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load AI reports."
      );

    } finally {

      setIsLoading(false);

    }

  };


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadReports();

  }, []);


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
     FORMAT TIME
  ============================================================ */

  const formatTime = (date) => {

    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  /* ============================================================
     FILTER REPORTS
  ============================================================ */

  const filteredReports =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      return assessments.filter(
        (assessment) => {

          const patientName =
            assessment.patientId
              ?.fullName
              ?.toLowerCase() || "";


          const prediction =
            assessment.prediction
              ?.toLowerCase() || "";


          const performedBy =
            assessment.createdBy
              ?.fullName
              ?.toLowerCase() || "";


          const matchesSearch =
            !search ||
            patientName.includes(search) ||
            prediction.includes(search) ||
            performedBy.includes(search);


          const matchesPrediction =
            predictionFilter === "All" ||
            assessment.prediction ===
              predictionFilter;


          return (
            matchesSearch &&
            matchesPrediction
          );

        }
      );

    }, [
      assessments,
      searchTerm,
      predictionFilter,
    ]);


  /* ============================================================
     PREDICTION CLASS
  ============================================================ */

  const getPredictionClass =
    (prediction) => {

      switch (prediction) {

        case "Non Demented":
          return "ai-report-badge ai-report-badge--normal";

        case "Very Mild Dementia":
          return "ai-report-badge ai-report-badge--very-mild";

        case "Mild Dementia":
          return "ai-report-badge ai-report-badge--mild";

        case "Moderate Dementia":
          return "ai-report-badge ai-report-badge--moderate";

        default:
          return "ai-report-badge";

      }

    };


  /* ============================================================
     PERFORMED BY
  ============================================================ */

  const getPerformedBy =
    (assessment) => {

      const user =
        assessment.createdBy;

      if (!user) {

        return {
          name: "Previously recorded",
          role: "",
          type: "unknown",
        };

      }


      if (user.role === "caregiver") {

        return {
          name:
            user.fullName ||
            "Caregiver",
          role: "Caregiver",
          type: "caregiver",
        };

      }


      return {
        name:
          user.fullName ||
          "Doctor",
        role: "Doctor",
        type: "doctor",
      };

    };


  /* ============================================================
     SUMMARY VALUES
  ============================================================ */

  const totalReports =
    assessments.length;


  const mildReports =
    assessments.filter(
      (item) =>
        item.prediction ===
          "Mild Dementia" ||
        item.prediction ===
          "Moderate Dementia"
    ).length;


  const normalReports =
    assessments.filter(
      (item) =>
        item.prediction ===
        "Non Demented"
    ).length;


  const caregiverReports =
    assessments.filter(
      (item) =>
        item.createdBy?.role ===
        "caregiver"
    ).length;


  /* ============================================================
     VIEW REPORT
  ============================================================ */

  const handleViewReport =
    (assessment) => {

      navigate(
        `/doctor/ai-reports/${assessment._id}`
      );

    };


  /* ============================================================
     RENDER
  ============================================================ */

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


        <div className="doctor-dashboard__content doctor-ai-reports">


          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section className="doctor-ai-reports__header">

            <div>

              <span>
                ARTIFICIAL INTELLIGENCE
              </span>

              <h1>
                AI Reports
              </h1>

              <p>
                Review AI-assisted assessments
                generated for your patients.
              </p>

            </div>


            <button
              type="button"
              className="doctor-ai-reports__refresh"
              onClick={loadReports}
              disabled={isLoading}
            >

              <FaSyncAlt />

              Refresh Reports

            </button>

          </section>


          {/* ==================================================
              SUMMARY
          ================================================== */}

          <section className="doctor-ai-reports__summary">


            <div className="ai-report-summary-card">

              <div className="ai-report-summary-card__icon">
                <FaBrain />
              </div>

              <div>

                <span>
                  Total Reports
                </span>

                <strong>
                  {isLoading
                    ? "..."
                    : totalReports}
                </strong>

              </div>

            </div>


            <div className="ai-report-summary-card">

              <div className="ai-report-summary-card__icon">
                <FaChartBar />
              </div>

              <div>

                <span>
                  Requires Review
                </span>

                <strong>
                  {isLoading
                    ? "..."
                    : mildReports}
                </strong>

              </div>

            </div>


            <div className="ai-report-summary-card">

              <div className="ai-report-summary-card__icon">
                <FaUserInjured />
              </div>

              <div>

                <span>
                  Non Demented
                </span>

                <strong>
                  {isLoading
                    ? "..."
                    : normalReports}
                </strong>

              </div>

            </div>


            <div className="ai-report-summary-card">

              <div className="ai-report-summary-card__icon">
                <FaUserNurse />
              </div>

              <div>

                <span>
                  Caregiver Assessments
                </span>

                <strong>
                  {isLoading
                    ? "..."
                    : caregiverReports}
                </strong>

              </div>

            </div>

          </section>


          {/* ==================================================
              REPORTS CARD
          ================================================== */}

          <section className="doctor-dashboard__card doctor-ai-reports__card">


            {/* ==================================================
                TOOLBAR
            ================================================== */}

            <div className="doctor-ai-reports__toolbar">


              <div className="doctor-ai-reports__toolbar-title">

                <div>

                  <span>
                    ASSESSMENT HISTORY
                  </span>

                  <h2>
                    Patient AI Assessments
                  </h2>

                </div>

                <strong>
                  {filteredReports.length} reports
                </strong>

              </div>


              <div className="doctor-ai-reports__filters">


                {/* SEARCH */}

                <div className="doctor-ai-reports__search">

                  <FaSearch />

                  <input
                    type="text"
                    placeholder="Search patient or prediction..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                  />

                </div>


                {/* FILTER */}

                <select
                  value={predictionFilter}
                  onChange={(event) =>
                    setPredictionFilter(
                      event.target.value
                    )
                  }
                  className="doctor-ai-reports__select"
                >

                  <option value="All">
                    All Predictions
                  </option>

                  <option value="Non Demented">
                    Non Demented
                  </option>

                  <option value="Very Mild Dementia">
                    Very Mild Dementia
                  </option>

                  <option value="Mild Dementia">
                    Mild Dementia
                  </option>

                  <option value="Moderate Dementia">
                    Moderate Dementia
                  </option>

                </select>

              </div>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

              <div className="doctor-ai-reports__error">

                <span>
                  {error}
                </span>

                <button
                  type="button"
                  onClick={loadReports}
                >
                  Try Again
                </button>

              </div>

            )}


            {/* ==================================================
                LOADING
            ================================================== */}

            {isLoading && (

              <div className="doctor-ai-reports__empty">

                <FaBrain />

                <strong>
                  Loading AI reports...
                </strong>

              </div>

            )}


            {/* ==================================================
                NO RESULTS
            ================================================== */}

            {!isLoading &&
              !error &&
              filteredReports.length === 0 && (

                <div className="doctor-ai-reports__empty">

                  <FaBrain />

                  <strong>
                    No AI reports found
                  </strong>

                  <span>
                    {searchTerm ||
                    predictionFilter !== "All"
                      ? "Try changing your search or filter."
                      : "AI assessments will appear here after they are completed."}
                  </span>

                </div>

              )}


            {/* ==================================================
                TABLE
            ================================================== */}

            {!isLoading &&
              !error &&
              filteredReports.length > 0 && (

                <div className="doctor-ai-reports__table-wrapper">

                  <table className="doctor-ai-reports__table">

                    <thead>

                      <tr>

                        <th>
                          Patient
                        </th>

                        <th>
                          AI Prediction
                        </th>

                        <th>
                          Confidence
                        </th>

                        <th>
                          Assessed By
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Model
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredReports.map(
                        (assessment) => {

                          const performer =
                            getPerformedBy(
                              assessment
                            );


                          return (

                            <tr
                              key={
                                assessment._id
                              }
                            >


                              {/* PATIENT */}

                              <td>

                                <div className="ai-report-patient">

                                  {assessment.patientId
                                    ?.profilePicture
                                    ?.url ? (

                                    <img
                                      src={
                                        assessment
                                          .patientId
                                          .profilePicture
                                          .url
                                      }
                                      alt={
                                        assessment
                                          .patientId
                                          ?.fullName ||
                                        "Patient"
                                      }
                                    />

                                  ) : (

                                    <div className="ai-report-patient__avatar">

                                      {assessment
                                        .patientId
                                        ?.fullName
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "P"}

                                    </div>

                                  )}


                                  <div>

                                    <strong>
                                      {
                                        assessment
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

                              </td>


                              {/* PREDICTION */}

                              <td>

                                <span
                                  className={
                                    getPredictionClass(
                                      assessment.prediction
                                    )
                                  }
                                >
                                  {
                                    assessment.prediction ||
                                    "Unknown"
                                  }
                                </span>

                              </td>


                              {/* CONFIDENCE */}

                              <td>

                                <div className="ai-report-confidence">

                                  <div className="ai-report-confidence__top">

                                    <strong>
                                      {
                                        Number(
                                          assessment.confidence ||
                                          0
                                        ).toFixed(2)
                                      }%
                                    </strong>

                                  </div>

                                  <div className="ai-report-confidence__bar">

                                    <div
                                      style={{
                                        width: `${Math.min(
                                          Number(
                                            assessment.confidence ||
                                            0
                                          ),
                                          100
                                        )}%`,
                                      }}
                                    />

                                  </div>

                                </div>

                              </td>


                              {/* PERFORMED BY */}

                              <td>

                                <div className="ai-report-performer">

                                  <span className="ai-report-performer__icon">

                                    {performer.type ===
                                    "caregiver" ? (
                                      <FaUserNurse />
                                    ) : (
                                      <FaUserMd />
                                    )}

                                  </span>

                                  <div>

                                    <strong>
                                      {
                                        performer.name
                                      }
                                    </strong>

                                    <span>
                                      {
                                        performer.role
                                      }
                                    </span>

                                  </div>

                                </div>

                              </td>


                              {/* DATE */}

                              <td>

                                <div className="ai-report-date">

                                  <FaCalendarAlt />

                                  <div>

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

                              </td>


                              {/* MODEL */}

                              <td>

                                <div className="ai-report-model">

                                  <strong>
                                    {
                                      assessment
                                        .model
                                        ?.name ||
                                      "EfficientNetB0"
                                    }
                                  </strong>

                                  <span>
                                    v{
                                      assessment
                                        .model
                                        ?.version ||
                                      "1.0"
                                    }
                                  </span>

                                </div>

                              </td>


                              {/* ACTION */}

                              <td>

                                <button
                                  type="button"
                                  className="ai-report-view-button"
                                  onClick={() =>
                                    handleViewReport(
                                      assessment
                                    )
                                  }
                                >

                                  <FaEye />

                                  View Report

                                </button>

                              </td>

                            </tr>

                          );

                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

          </section>


          {/* ==================================================
              DISCLAIMER
          ================================================== */}

          <div className="doctor-ai-reports__disclaimer">

            <FaBrain />

            <p>

              <strong>
                AI-assisted prediction:
              </strong>{" "}

              These results are intended to
              support clinical review and should
              not be considered an independent
              medical diagnosis.

            </p>

          </div>

        </div>

      </main>

    </div>
  );
};


export default DoctorAIReports;