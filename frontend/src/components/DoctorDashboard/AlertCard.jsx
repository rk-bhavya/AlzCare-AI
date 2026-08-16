import { useEffect, useState } from "react";

import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

import {
  getDoctorPatientsNeedingAttention,
} from "../../api/assessment.api.js";


const AlertCard = () => {

  /* ============================================================
     STATE
  ============================================================ */

  const [alerts, setAlerts] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ============================================================
     LOAD ALERTS
  ============================================================ */

  const loadAlerts = async () => {

    try {

      setIsLoading(true);
      setError("");

      const response =
        await getDoctorPatientsNeedingAttention();

      const assessments =
        response.patients || [];


      /* --------------------------------------------------------
         CONVERT ASSESSMENTS INTO ALERTS
      -------------------------------------------------------- */

      const formattedAlerts =
        assessments.map(
          (assessment) => {

            const prediction =
              assessment.prediction;

            const isModerate =
              prediction ===
              "Moderate Dementia";

            return {
              id:
                assessment._id,

              patient:
                assessment.patientId
                  ?.fullName ||
                "Unknown Patient",

              message:
                isModerate
                  ? "Latest AI assessment indicates moderate dementia and requires review."
                  : "Latest AI assessment indicates mild dementia and requires monitoring.",

              severity:
                isModerate
                  ? "Critical"
                  : "Warning",

              createdAt:
                assessment.createdAt,
            };
          }
        );


      setAlerts(
        formattedAlerts
      );

    } catch (error) {

      console.error(
        "Unable to load alerts:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load alerts."
      );

    } finally {

      setIsLoading(false);

    }
  };


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadAlerts();
  }, []);


  /* ============================================================
     FORMAT RELATIVE TIME
  ============================================================ */

  const formatRelativeTime = (
    createdAt
  ) => {

    if (!createdAt) {
      return "Recently";
    }

    const createdTime =
      new Date(
        createdAt
      ).getTime();

    const currentTime =
      Date.now();

    const difference =
      Math.max(
        0,
        currentTime -
          createdTime
      );

    const minutes = Math.floor(
      difference /
        (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min${
        minutes === 1
          ? ""
          : "s"
      } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours === 1
          ? ""
          : "s"
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    return `${days} day${
      days === 1
        ? ""
        : "s"
    } ago`;
  };


  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (isLoading) {

    return (
      <section className="doctor-dashboard__card">

        <div className="doctor-card-header">

          <div>

            <span>
              PATIENT SAFETY
            </span>

            <h2>
              Recent Alerts
            </h2>

          </div>

        </div>


        <div
          style={{
            minHeight: "180px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            color: "#7a8797",
            fontSize: "13px",
          }}
        >

          <FaSpinner />

          Loading alerts...

        </div>

      </section>
    );
  }


  /* ============================================================
     ERROR STATE
  ============================================================ */

  if (error) {

    return (
      <section className="doctor-dashboard__card">

        <div className="doctor-card-header">

          <div>

            <span>
              PATIENT SAFETY
            </span>

            <h2>
              Recent Alerts
            </h2>

          </div>

        </div>


        <div
          style={{
            minHeight: "180px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#a43c3c",
            fontSize: "13px",
            padding: "20px",
          }}
        >

          {error}

        </div>

      </section>
    );
  }


  /* ============================================================
     NO ALERTS
  ============================================================ */

  if (alerts.length === 0) {

    return (
      <section className="doctor-dashboard__card">

        <div className="doctor-card-header">

          <div>

            <span>
              PATIENT SAFETY
            </span>

            <h2>
              Recent Alerts
            </h2>

          </div>

        </div>


        <div
          style={{
            minHeight: "180px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "20px",
          }}
        >

          <FaCheckCircle
            style={{
              fontSize: "32px",
              marginBottom: "12px",
              color: "#4f8a68",
            }}
          />

          <strong
            style={{
              color: "#34445a",
              fontSize: "15px",
              marginBottom: "6px",
            }}
          >
            No active alerts
          </strong>

          <span
            style={{
              color: "#8996a7",
              fontSize: "12px",
            }}
          >
            No patients currently require
            additional review.
          </span>

        </div>

      </section>
    );
  }


  /* ============================================================
     RENDER ALERTS
  ============================================================ */

  return (
    <section className="doctor-dashboard__card">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="doctor-card-header">

        <div>

          <span>
            PATIENT SAFETY
          </span>

          <h2>
            Recent Alerts
          </h2>

        </div>

      </div>


      {/* ======================================================
          ALERT LIST
      ====================================================== */}

      <div className="doctor-alerts">

        {alerts
          .slice(0, 4)
          .map((alert) => {

            const isCritical =
              alert.severity ===
              "Critical";

            const isWarning =
              alert.severity ===
              "Warning";


            return (
              <div
                className={`doctor-alert ${
                  isCritical
                    ? "doctor-alert--critical"
                    : isWarning
                    ? "doctor-alert--warning"
                    : "doctor-alert--info"
                }`}
                key={alert.id}
              >

                {/* ICON */}

                <div className="doctor-alert__icon">

                  {isCritical ||
                  isWarning ? (
                    <FaExclamationTriangle />
                  ) : (
                    <FaInfoCircle />
                  )}

                </div>


                {/* CONTENT */}

                <div className="doctor-alert__content">

                  <div>

                    <strong>
                      {alert.patient}
                    </strong>

                    <span>
                      {alert.severity}
                    </span>

                  </div>


                  <p>
                    {alert.message}
                  </p>


                  <small>
                    {formatRelativeTime(
                      alert.createdAt
                    )}
                  </small>

                </div>

              </div>
            );
          })}

      </div>

    </section>
  );
};


export default AlertCard;