import {
  FaUserInjured,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaBrain,
} from "react-icons/fa";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";
import SummaryCard from "../../components/DoctorDashboard/SummaryCard";
import PatientOverview from "../../components/DoctorDashboard/PatientOverview";
import PredictionCard from "../../components/DoctorDashboard/PredictionCard";
import AppointmentCard from "../../components/DoctorDashboard/AppointmentCard";
import AlertCard from "../../components/DoctorDashboard/AlertCard";
import QuickActions from "../../components/DoctorDashboard/QuickActions";

import "./DoctorDashboard.css";

const DoctorDashboard = () => {
  return (
    <div className="doctor-dashboard">

      {/* SIDEBAR */}

      <DoctorSidebar
        activePage="Dashboard"
      />

      {/* MAIN */}

      <main className="doctor-dashboard__main">

        <DoctorHeader />

        <div className="doctor-dashboard__content">

          {/* SUMMARY */}

          <section className="doctor-summary-grid">

            <SummaryCard
              title="Total Patients"
              value="24"
              description="Patients currently assigned"
              icon={<FaUserInjured />}
            />

            <SummaryCard
              title="Needs Attention"
              value="5"
              description="Patients requiring review"
              icon={
                <FaExclamationTriangle />
              }
              className="summary-warning"
            />

            <SummaryCard
              title="Today's Appointments"
              value="4"
              description="Scheduled for today"
              icon={<FaCalendarAlt />}
            />

            <SummaryCard
              title="Recent Assessments"
              value="8"
              description="AI assessments this week"
              icon={<FaBrain />}
            />

          </section>

          {/* PATIENTS */}

          <PatientOverview />

          {/* TWO COLUMN */}

          <section className="doctor-dashboard__two-column">

            <PredictionCard />

            <AppointmentCard />

          </section>

          {/* ALERTS + QUICK ACTIONS */}

          <section className="doctor-dashboard__two-column">

            <AlertCard />

            <QuickActions />

          </section>

        </div>

      </main>

    </div>
  );
};

export default DoctorDashboard;
