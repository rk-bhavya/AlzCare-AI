import { useEffect, useState } from "react";

import {
  FaUserInjured,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaBrain,
} from "react-icons/fa";

import axiosInstance from "../../api/axiosinstance.js";

import {
  getDoctorAssessmentCount,
  getDoctorPatientsNeedingAttention,
} from "../../api/assessment.api.js";

import {
  getTodaysAppointments,
} from "../../api/appointment.api.js";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";
import SummaryCard from "../../components/DoctorDashboard/SummaryCard";
import PatientOverview from "../../components/DoctorDashboard/PatientOverview";
import PredictionCard from "../../components/DoctorDashboard/PredictionCard";
import AppointmentCard from "../../components/DoctorDashboard/AppointmentCard";
import AlertCard from "../../components/DoctorDashboard/AlertCard";
import QuickActions from "../../components/DoctorDashboard/QuickActions";
import AIAssessment from "../../components/AIAssessment/AIAssessment";

import "./DoctorDashboard.css";


const DoctorDashboard = () => {

  /* ============================================================
     PATIENT DATA
  ============================================================ */

  const [patients, setPatients] =
    useState([]);

  const [isLoadingPatients, setIsLoadingPatients] =
    useState(true);

  const [patientError, setPatientError] =
    useState("");


  /* ============================================================
     ASSESSMENT COUNT
  ============================================================ */

  const [assessmentCount, setAssessmentCount] =
    useState(0);

  const [isLoadingAssessmentCount, setIsLoadingAssessmentCount] =
    useState(true);


  /* ============================================================
     TODAY'S APPOINTMENTS
  ============================================================ */

  const [todaysAppointments, setTodaysAppointments] =
    useState(0);

  const [isLoadingAppointments, setIsLoadingAppointments] =
    useState(true);


  /* ============================================================
     PATIENTS NEEDING ATTENTION
  ============================================================ */

  const [patientsNeedingAttention, setPatientsNeedingAttention] =
    useState(0);

  const [isLoadingAttention, setIsLoadingAttention] =
    useState(true);


  /* ============================================================
     LOAD PATIENTS
  ============================================================ */

  const loadPatients = async () => {

    try {

      setIsLoadingPatients(true);
      setPatientError("");

      const response =
        await axiosInstance.get(
          "/doctor/patients"
        );

      setPatients(
        response.data?.patients || []
      );

    } catch (error) {

      console.error(
        "Unable to load dashboard patients:",
        error
      );

      setPatientError(
        error.response?.data?.message ||
          "Unable to load patient information."
      );

    } finally {

      setIsLoadingPatients(false);

    }
  };


  /* ============================================================
     LOAD ASSESSMENT COUNT
  ============================================================ */

  const loadAssessmentCount = async () => {

    try {

      setIsLoadingAssessmentCount(true);

      const response =
        await getDoctorAssessmentCount();

      setAssessmentCount(
        response.count || 0
      );

    } catch (error) {

      console.error(
        "Unable to load assessment count:",
        error
      );

      setAssessmentCount(0);

    } finally {

      setIsLoadingAssessmentCount(false);

    }
  };


  /* ============================================================
     LOAD TODAY'S APPOINTMENTS
  ============================================================ */

  const loadTodaysAppointments = async () => {

    try {

      setIsLoadingAppointments(true);

      const response =
        await getTodaysAppointments();

      setTodaysAppointments(
        response.count ||
        response.appointments?.length ||
        0
      );

    } catch (error) {

      console.error(
        "Unable to load today's appointments:",
        error
      );

      setTodaysAppointments(0);

    } finally {

      setIsLoadingAppointments(false);

    }
  };


  /* ============================================================
     LOAD PATIENTS NEEDING ATTENTION
  ============================================================ */

  const loadPatientsNeedingAttention =
    async () => {

      try {

        setIsLoadingAttention(true);

        const response =
          await getDoctorPatientsNeedingAttention();

        setPatientsNeedingAttention(
          response.count || 0
        );

      } catch (error) {

        console.error(
          "Unable to load patients needing attention:",
          error
        );

        setPatientsNeedingAttention(0);

      } finally {

        setIsLoadingAttention(false);

      }
    };


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadPatients();
    loadAssessmentCount();
    loadTodaysAppointments();
    loadPatientsNeedingAttention();

  }, []);


  /* ============================================================
     DYNAMIC SUMMARY VALUES
  ============================================================ */

  const totalPatients =
    patients.length;


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="doctor-dashboard">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <DoctorSidebar
        activePage="Dashboard"
      />


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="doctor-dashboard__main">

        <DoctorHeader />


        <div className="doctor-dashboard__content">


          {/* ==================================================
              4 SUMMARY CARDS
          ================================================== */}

          <section className="doctor-summary-grid">

            <SummaryCard
              title="Total Patients"
              value={
                isLoadingPatients
                  ? "..."
                  : totalPatients
              }
              description="Patients currently assigned"
              icon={
                <FaUserInjured />
              }
            />

            <SummaryCard
              title="Needs Attention"
              value={
                isLoadingAttention
                  ? "..."
                  : patientsNeedingAttention
              }
              description="Patients requiring review"
              icon={
                <FaExclamationTriangle />
              }
              className="summary-warning"
            />

            <SummaryCard
              title="Today's Appointments"
              value={
                isLoadingAppointments
                  ? "..."
                  : todaysAppointments
              }
              description="Scheduled appointments"
              icon={
                <FaCalendarAlt />
              }
            />

            <SummaryCard
              title="Recent Assessments"
              value={
                isLoadingAssessmentCount
                  ? "..."
                  : assessmentCount
              }
              description="AI assessments"
              icon={
                <FaBrain />
              }
            />

          </section>


          {/* ==================================================
              PATIENT MANAGEMENT
          ================================================== */}

          <section id="doctor-patients">

            <PatientOverview
              patients={patients}
              isLoading={
                isLoadingPatients
              }
              error={
                patientError
              }
              onRefresh={
                loadPatients
              }
            />

          </section>


          {/* ==================================================
              AI ASSESSMENT
          ================================================== */}

          <section id="doctor-ai-assessment">

            <AIAssessment
              patients={patients}
            />

          </section>


          {/* ==================================================
              LATEST AI REPORT + APPOINTMENTS
          ================================================== */}

          <section
            id="doctor-appointments"
            className="doctor-dashboard__two-column"
          >

            <div className="doctor-dashboard__column-card">
              <PredictionCard />
            </div>

            <div className="doctor-dashboard__column-card">
              <AppointmentCard />
            </div>

          </section>


          {/* ==================================================
              ALERTS
          ================================================== */}

          <section id="doctor-alerts">

            <AlertCard />

          </section>


          {/* ==================================================
              QUICK ACTIONS — BOTTOM
          ================================================== */}

          <section className="doctor-dashboard__quick-actions">

            <QuickActions />

          </section>


        </div>

      </main>

    </div>
  );
};


export default DoctorDashboard;