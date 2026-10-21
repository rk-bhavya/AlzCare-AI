import { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance.js";

import {
  getDoctorAssessmentCount,
  getDoctorPatientsNeedingAttention,
  getDoctorAssessments,
} from "../../api/assessment.api.js";

import {
  getTodaysAppointments,
} from "../../api/appointment.api.js";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";
import PatientOverview from "../../components/DoctorDashboard/PatientOverview";
import PredictionCard from "../../components/DoctorDashboard/PredictionCard";
import AppointmentCard from "../../components/DoctorDashboard/AppointmentCard";
import AlertCard from "../../components/DoctorDashboard/AlertCard";
import QuickActions from "../../components/DoctorDashboard/QuickActions";
import AIAssessment from "../../components/AIAssessment/AIAssessment";

import StatsCards from "../../components/DoctorDashboard/StatsCards.jsx";
import RiskDistributionChart from "../../components/DoctorDashboard/RiskDistributionChart.jsx";
import AssessmentTrendChart from "../../components/DoctorDashboard/AssessmentTrendChart.jsx";
import PatientAgeChart from "../../components/DoctorDashboard/PatientAgeChart.jsx";
import RecentPatients from "../../components/DoctorDashboard/RecentPatients.jsx";
import RecentAssessments from "../../components/DoctorDashboard/RecentAssessments.jsx";
import PatientsRequiringAttention from "../../components/DoctorDashboard/PatientsRequiringAttention.jsx";
import AIInsights from "../../components/DoctorDashboard/AIInsights.jsx";

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
     ALL ASSESSMENTS (for charts / recent assessments / insights)
  ============================================================ */

  const [assessments, setAssessments] =
    useState([]);

  const [isLoadingAssessments, setIsLoadingAssessments] =
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
     LOAD ALL ASSESSMENTS

     Reuses the same getDoctorAssessments() endpoint already
     used by the existing AI Reports page — powers the charts,
     Recent Assessments, Patients Requiring Attention list, and
     AI Insights below, all from one real data source.
  ============================================================ */

  const loadAssessments = async () => {

    try {

      setIsLoadingAssessments(true);

      const response =
        await getDoctorAssessments();

      setAssessments(
        response.assessments || []
      );

    } catch (error) {

      console.error(
        "Unable to load assessments:",
        error
      );

      setAssessments([]);

    } finally {

      setIsLoadingAssessments(false);

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
    loadAssessments();

  }, []);


  /* ============================================================
     DYNAMIC SUMMARY VALUES
  ============================================================ */

  const totalPatients =
    patients.length;

  const activePatients =
    patients.filter(
      (patient) => patient.assignment?.status === "active"
    ).length;


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
              KPI STAT CARDS
          ================================================== */}

          <StatsCards
            totalPatients={totalPatients}
            isLoadingPatients={isLoadingPatients}
            activePatients={activePatients}
            assessmentsCompleted={assessmentCount}
            isLoadingAssessments={isLoadingAssessmentCount}
            patientsNeedingAttention={patientsNeedingAttention}
            isLoadingAttention={isLoadingAttention}
          />


          {/* ==================================================
              CHARTS — Risk Distribution / Trend / Age
          ================================================== */}

          <section className="doctor-charts-grid">

            <RiskDistributionChart
              assessments={assessments}
              isLoading={isLoadingAssessments}
            />

            <AssessmentTrendChart
              assessments={assessments}
              isLoading={isLoadingAssessments}
            />

            <PatientAgeChart
              patients={patients}
              isLoading={isLoadingPatients}
            />

          </section>


          {/* ==================================================
              RECENT PATIENTS + RECENT ASSESSMENTS
          ================================================== */}

          <section className="doctor-lists-grid">

            <RecentPatients
              patients={patients}
              isLoading={isLoadingPatients}
            />

            <RecentAssessments
              assessments={assessments}
              isLoading={isLoadingAssessments}
            />

          </section>


          {/* ==================================================
              PATIENTS REQUIRING ATTENTION + AI INSIGHTS
          ================================================== */}

          <section className="doctor-lists-grid">

            <PatientsRequiringAttention
              patients={patients}
              assessments={assessments}
              isLoading={isLoadingPatients || isLoadingAssessments}
            />

            <AIInsights
              patients={patients}
              assessments={assessments}
              isLoading={isLoadingAssessments}
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